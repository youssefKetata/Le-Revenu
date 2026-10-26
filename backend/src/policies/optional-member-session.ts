import memberSession from './member-session';

// Anonymous reads remain public; personalized vote state requires an active session.
export default (async (ctx, config, context) => ctx.state.user
  ? memberSession(ctx, config, context)
  : true) satisfies typeof memberSession;
