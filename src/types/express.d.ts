import type { PublicUserRow } from './models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  namespace Express {
    interface Request {
      /**
       * Set by the `authenticate` middleware after verifying the JWT bearer
       * token. Undefined on routes that don't require authentication.
       */
      user?: PublicUserRow;
    }
  }
}

export {};
