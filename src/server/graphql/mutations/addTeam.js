import {GraphQLBoolean, GraphQLList, GraphQLNonNull} from 'graphql';
import Invitee from 'server/graphql/types/Invitee';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {ensureUniqueId, getUserId, getUserOrgDoc, requireUserInOrg} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';
import createTeamAndLeader from '../models/Team/createFirstTeam/createTeamAndLeader';
import addTeamValidation from './helpers/addTeamValidation';
import TeamInput from 'server/graphql/types/TeamInput';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    }
  },
  async resolve(source, args, {authToken, dataLoader, socketId}) {
    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireUserInOrg(userOrgDoc, userId, orgId);

    // VALIDATION
    const {data: {invitees, newTeam}, errors} = addTeamValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const teamId = shortid.generate();
    const newAuthToken = {
      ...authToken,
      tms: Array.isArray(authToken.tms) ? authToken.tms.concat(teamId) : [teamId],
      exp: undefined
    };
    await createTeamAndLeader(userId, {id: teamId, ...newTeam});
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken});

    const inviteeCount = invitees && invitees.length || 0;
    sendSegmentEvent('New Team', userId, {teamId, orgId, inviteeCount});

    // handle invitees
    if (inviteeCount > 0) {
      await inviteTeamMembers(invitees, teamId, userId, dataLoader, socketId);
    }
    // TODO return a real payload when we move teams to relay
    return true;
  }
};