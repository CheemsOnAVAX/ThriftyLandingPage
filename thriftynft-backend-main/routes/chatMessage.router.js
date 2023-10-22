module.exports = (app) => {
  const Collection = require('../app/controllers/chatMessage.controller.js');
  const { getUser } = require('../middlewares/auth.middleware.js');
  app.post('/get-chat-message', getUser, Collection.getChatMessages);
  app.post('/add-chat-Message', getUser, Collection.addChatMessage);
};
