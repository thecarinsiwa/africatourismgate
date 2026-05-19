import {
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_TYPE,
} from '../auth.constants';

export interface AccessJwtPayload {
  sub: string;
  email: string;
  type: typeof ACCESS_TOKEN_TYPE;
}

export interface RefreshJwtPayload {
  sub: string;
  sid: string;
  type: typeof REFRESH_TOKEN_TYPE;
}
