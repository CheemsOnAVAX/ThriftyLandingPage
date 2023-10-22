module.exports = (app) => {
  const Follower = require('../app/controllers/follower.controller.js');
  const { getUser } = require('../middlewares/auth.middleware.js');

  app.post('/send-friend-request', getUser, Follower.sendFriendRequest);
  app.post('/accept-friend-request', getUser, Follower.acceptFriendRequest);
  app.post('/cancel-friend-request', getUser, Follower.cancelFriendRequest);
  app.post(
    '/add-suggestion-ignore-list',
    getUser,
    Follower.addToSuggestionIgnoreList
  );
  app.post('/unfriend', getUser, Follower.unfriend);

  app.get('/get-friend-list', getUser, Follower.getFriendList);
  app.get('/get-request-list', getUser, Follower.getRequestList);
  app.get('/get-suggested-friends', getUser, Follower.getSuggestedFriends);
};
