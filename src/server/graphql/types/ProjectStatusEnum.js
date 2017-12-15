// @flow
import {GraphQLEnumType} from 'graphql';
import {ACTIVE, DONE, FUTURE, STUCK} from 'universal/utils/constants';

export type ProjectStatusEnumT = ACTIVE | STUCK | DONE | FUTURE;

const ProjectStatusEnum = new GraphQLEnumType({
  name: 'ProjectStatusEnum',
  description: 'The status of the project',
  values: {
    [ACTIVE]: {},
    [STUCK]: {},
    [DONE]: {},
    [FUTURE]: {}
  }
});

export default ProjectStatusEnum;
