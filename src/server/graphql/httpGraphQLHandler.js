// @flow

import type {Request, Response} from 'express';
import type {AuthToken} from '../../universal/data/auth';

import Schema from './rootSchema';
import IntranetSchema from './intranetSchema';
import {graphql} from 'graphql';

export type Context = {
  authToken: AuthToken,
  exchange: mixed
};

const makeHandler = (schema, errorText) => (exchange: mixed) => async (req: Request, res: Response) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const context = {authToken, exchange};
  const result = await graphql(schema, query, {}, context, variables);
  if (result.errors) {
    console.log(`${errorText}:`, result.errors);
  }
  res.send(result);
};

/* The Application HTTP GraphQL Handler as Express middleware */
export default makeHandler(Schema, 'DEBUG GraphQL Error');

/* The Intranet HTTP GraphQL Handler as Express middleware */
export const intranetHttpGraphQLHandler = makeHandler(IntranetSchema, 'DEBUG intranet-GraphQL Error');
