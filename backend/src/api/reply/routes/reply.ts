export default {
  routes: [
    { method: 'GET', path: '/discussions/:documentId/replies', handler: 'reply.find', config: { policies: ['global::optional-member-session'] } },
    { method: 'POST', path: '/discussions/:documentId/replies/:replyId/useful', handler: 'reply.useful', config: { policies: ['global::member-session'] } },
    { method: 'POST', path: '/discussions/:documentId/replies', handler: 'reply.create', config: { policies: ['global::member-session'] } },
  ],
};
