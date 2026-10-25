export default {
  routes: [
    { method: 'GET', path: '/discussions', handler: 'discussion.find' },
    { method: 'GET', path: '/discussions/:documentId', handler: 'discussion.findOne' },
  ],
};
