// @flow
import type {Notification} from 'universal/types/notification';
import type {CreateProjectInputT} from 'server/graphql/types/CreateProjectInput';
import type {AreaEnumT} from 'server/graphql/types/AreaEnum';
import type {CreateProjectPayloadT} from 'server/graphql/types/CreateProjectPayload';
import type {GraphQLContext} from 'server/types/graphQLContext';

import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import CreateProjectInput from 'server/graphql/types/CreateProjectInput';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {projectInvolvesNotification} from 'universal/types/notification';
import {teamMemberId} from 'universal/types/teamMember';
import {
  ASSIGNEE,
  MEETING,
  MENTIONEE,
  NOTIFICATIONS_ADDED,
  PROJECT_CREATED,
  PROJECT_INVOLVES,
  TEAM_DASH,
  USER_DASH
} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';

type Args = {
  area: AreaEnumT,
  newProject: CreateProjectInputT
};

export default {
  type: CreateProjectPayload,
  description: 'Create a new project, triggering a CreateCard for other viewers',
  args: {
    newProject: {
      type: new GraphQLNonNull(CreateProjectInput),
      description: 'The new project including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve<Source>(
    source: Source,
    {newProject, area}: Args,
    {authToken, dataLoader, socketId}: GraphQLContext
  ): Promise<CreateProjectPayloadT> {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();

    // AUTH
    const myUserId = getUserId(authToken);

    // VALIDATION
    const schema = makeProjectSchema();
    const {errors, data: validNewProject} = schema({content: '1', ...newProject});
    handleSchemaErrors(errors);
    const {teamId, userId, content} = validNewProject;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {entityMap} = JSON.parse(content);
    const project = {
      ...validNewProject,
      id: `${teamId}::${shortid.generate()}`,
      agendaId: validNewProject.agendaId,
      content: validNewProject.content,
      createdAt: now,
      createdBy: myUserId,
      sortOrder: validNewProject.sortOrder,
      status: validNewProject.status,
      tags: getTagsFromEntityMap(entityMap),
      teamId,
      teamMemberId: teamMemberId(userId, teamId),
      updatedAt: now,
      userId
    };
    const history = {
      id: shortid.generate(),
      content: project.content,
      projectId: project.id,
      status: project.status,
      teamMemberId: project.teamMemberId,
      updatedAt: project.updatedAt
    };
    await r({
      project: r.table('Project').insert(project),
      history: r.table('ProjectHistory').insert(history)
    });
    const projectCreated = {project};

    getPubSub().publish(`${PROJECT_CREATED}.${teamId}`, {projectCreated, operationId, mutatorId: socketId});
    getPubSub().publish(`${PROJECT_CREATED}.${userId}`, {projectCreated, operationId, mutatorId: socketId});

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = teamMemberId(myUserId, teamId);
    const notificationsToAdd: Array<Notification> = [];
    // if we did not self-assign, queue up an assignment notification
    if (changeAuthorId !== project.teamMemberId) {
      notificationsToAdd.push(
        projectInvolvesNotification({
          changeAuthorId,
          involvement: ASSIGNEE,
          projectId: project.id,
          startAt: now,
          teamId,
          userIds: [userId]
        })
      );
    }
    // queue up all mention notifications
    getTypeFromEntityMap('MENTION', entityMap)
      .filter((mention) => mention !== myUserId && mention !== project.userId)
      .forEach((mentioneeUserId) => {
        notificationsToAdd.push(
          projectInvolvesNotification({
            changeAuthorId,
            involvement: MENTIONEE,
            projectId: project.id,
            startAt: now,
            teamId,
            userIds: [mentioneeUserId]
          })
        );
      });
    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd);
      notificationsToAdd.forEach((notification: Notification) => {
        const notificationsAdded = {notifications: [notification]};
        const notificationUserId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_ADDED}.${notificationUserId}`, {notificationsAdded});
      });
    }
    return projectCreated;
  }
};
