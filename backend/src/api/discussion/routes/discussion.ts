export default {
  routes: [
    { method: 'POST', path: '/discussions/:documentId/best-answer', handler: 'discussion.bestAnswer', config: { policies: ['global::member-session'] } },
    { method: 'GET', path: '/discussions', handler: 'discussion.find' },
    { method: 'POST', path: '/discussions', handler: 'discussion.create', config: { policies: ['global::member-session'] } },
    { method: 'GET', path: '/discussions/:documentId', handler: 'discussion.findOne' },
  ],
};
