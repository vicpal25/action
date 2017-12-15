// @flow
import type {Project as ProjectT} from 'universal/types/project';

import {GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';

export type CreateProjectPayloadT = {
  project: ProjectT
}

const CreateProjectPayload = new GraphQLObjectType({
  name: 'CreateProjectPayload',
  fields: () => ({
    project: {
      type: Project
    }
  })
});

export default CreateProjectPayload;
