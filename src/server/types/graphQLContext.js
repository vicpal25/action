// @flow
import type {AuthToken} from 'universal/types/auth';

// TODO: This should probably live somewhere else and be more complete, but this
// is the bare minimum to get it working at the moment.
interface DataLoader {
  share(): void
};

export type GraphQLContext = {
  authToken: AuthToken,
  dataLoader: DataLoader,
  socketId: string
};
