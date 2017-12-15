// @flow

import type {TeamID} from './team';
import type {UserID} from './user';

export type AuthToken = {
  tms: TeamID[],
  iss: string,
  sub: UserID,
  aud: string,
  iat: number,
  exp: number
};
