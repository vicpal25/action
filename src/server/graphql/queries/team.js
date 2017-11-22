// @flow

import type {Context} from '../httpGraphQLHandler';
import type {AuthToken} from '../../../universal/data/auth';
import type {TeamID} from '../../../universal/data/team';

import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from '../../database/rethinkDriver';
import {requireSUOrTeamMember} from '../../utils/authorization';
import {errorObj} from '../../utils/utils';
import {Team} from '../models/Team/teamSchema';

type args = {
  teamId: TeamID
};

export default {
  type: Team,
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve(source: mixed, {teamId}: args, {authToken}: Context) {
    const r = getRethink();
    requireSUOrTeamMember(authToken, teamId);
    const team = await r.table('Team').get(teamId);
    if (!team) {
      throw errorObj({_error: 'Team ID not found'});
    }
    return team;
  }
};
