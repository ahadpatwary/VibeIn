import { env } from '@/config/env';
import type { AuthApi } from './auth.api';
import { httpAuthApi } from './auth.http';
import { mockAuthApi } from './auth.mock';

export type { AuthApi } from './auth.api';

/** The one object the rest of the module talks to. */
export const authApi: AuthApi = env.authMock ? mockAuthApi : httpAuthApi;
