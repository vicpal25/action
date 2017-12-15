// @flow
import type {ProjectStatusEnumT} from 'server/graphql/types/ProjectStatusEnum';
import type {TeamID} from 'universal/types/team';
import type {UserID} from 'universal/types/user';

import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

export type CreateProjectInputT = {
  agendaId: string,
  content: string,
  teamId: TeamID,
  userId: UserID,
  sortOrder: number,
  status: ProjectStatusEnumT
};

const CreateProjectInput = new GraphQLInputObjectType({
  name: 'CreateProjectInput',
  fields: () => ({
    agendaId: {
      type: GraphQLID,
      description: 'foreign key for AgendaItem'
    },
    content: {type: GraphQLString},
    teamId: {
      type: GraphQLID,
      description: 'teamId, the team the project is on'
    },
    userId: {
      type: GraphQLID,
      description: 'userId, the owner of the project'
    },
    sortOrder: {type: GraphQLFloat},
    status: {type: ProjectStatusEnum}
  })
});

export default CreateProjectInput;
