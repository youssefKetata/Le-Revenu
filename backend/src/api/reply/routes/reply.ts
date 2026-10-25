export default {
  routes: [{ method: 'GET', path: '/discussions/:documentId/replies', handler: 'reply.find' }],
};
