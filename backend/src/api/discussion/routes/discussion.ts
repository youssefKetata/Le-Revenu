export default {
  routes: [
    { method: 'GET', path: '/discussions', handler: 'discussion.find' },
    { method: 'POST', path: '/discussions', handler: 'discussion.create', config: { policies: ['global::member-session'] } },
    { method: 'GET', path: '/discussions/:documentId', handler: 'discussion.findOne' },
  ],
};
