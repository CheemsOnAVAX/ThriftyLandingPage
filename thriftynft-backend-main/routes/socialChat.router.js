module.exports = (app) => {
  const SocialChat = require('../app/controllers/socialChat.controller');
  const {
    getUserAddress,
    getUser,
    getUserAddressNoAuthUser,
  } = require('../middlewares/auth.middleware.js');

  app.post(
    '/add-social-conversation',
    getUser,
    SocialChat.addSocialConversation
  );
  app.get('/get-social-conversation', getUser, SocialChat.getConversation);
  app.post('/add-social-chat-message', getUser, SocialChat.addChatMessage);
  app.get('/get-social-chat-message', getUser, SocialChat.getChatMessage);
};
