export default {
  routes: [
    { method: 'GET', path: '/discussions/:documentId/replies', handler: 'reply.find' },
    { method: 'POST', path: '/discussions/:documentId/replies', handler: 'reply.create', config: { policies: ['global::member-session'] } },
  ],
};
