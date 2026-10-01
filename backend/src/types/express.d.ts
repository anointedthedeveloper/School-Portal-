import type { AuthUser } from './auth';
import type { ICBTIntegration } from '../models/CBTIntegration';
import type { HydratedDocument } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      cbtClient?: HydratedDocument<ICBTIntegration>;
    }
  }
}

export {};
