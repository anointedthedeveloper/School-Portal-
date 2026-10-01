import bcrypt from 'bcryptjs';
import { CBTIntegration, type CBTOperation } from '../models/CBTIntegration';
import { AppError } from '../utils/AppError';

// Dummy hash keeps response time uniform for unknown client ids.
const DUMMY_HASH = bcrypt.hashSync('cbt-timing-equaliser', 12);

export const cbtIntegrationService = {
  /** Verifies an integration client's credentials. Admin JWTs are never accepted here. */
  async authenticateClient(clientId: string, clientSecret: string) {
    const client = await CBTIntegration.findOne({ clientId }).select('+secretHash');
    const valid = await bcrypt.compare(clientSecret, client?.secretHash ?? DUMMY_HASH);
    if (!client || !valid) throw AppError.unauthorized('Invalid integration credentials');
    if (client.status !== 'ACTIVE') throw AppError.forbidden('Integration is not active');

    client.lastUsedAt = new Date();
    await client.save();
    return client;
  },

  assertOperation(allowed: readonly CBTOperation[], operation: CBTOperation) {
    if (!allowed.includes(operation)) throw AppError.forbidden(`Integration is not permitted to perform ${operation}`);
  },

  async createClient(params: { name: string; clientId: string; secret: string; allowedOperations: CBTOperation[] }) {
    const secretHash = await bcrypt.hash(params.secret, 12);
    return CBTIntegration.create({
      name: params.name,
      clientId: params.clientId,
      secretHash,
      allowedOperations: params.allowedOperations,
    });
  },
};
