module.exports = (app) => {
  const Collection = require('../app/controllers/conversation.controller.js');
  const { getUser } = require('../middlewares/auth.middleware.js');
  app.post('/get-conversation', getUser, Collection.getConversation);
  app.post('/add-conversation', getUser, Collection.addConversation);
};
