import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

// Native JWT authentication verifies the signature; also check session revocation.
export default async (
  ctx: { state: { user?: unknown; session?: { id: string } } },
  _config: unknown,
  { strapi }: { strapi: Core.Strapi },
) => {
  const sessionId = ctx.state.session?.id;
  if (!ctx.state.user || !sessionId
    || !await strapi.sessionManager('users-permissions').isSessionActive(sessionId)) {
    throw new errors.UnauthorizedError('The member session has expired. Please log in again.');
  }
  return true;
};
