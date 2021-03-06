import {GraphQLObjectType} from 'graphql';
import {resolveAgendaItem} from 'server/graphql/resolvers';
import AgendaItem from 'server/graphql/types/AgendaItem';

const UpdateAgendaItemPayload = new GraphQLObjectType({
  name: 'UpdateAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem,
      resolve: resolveAgendaItem
    }
  })
});

export default UpdateAgendaItemPayload;
