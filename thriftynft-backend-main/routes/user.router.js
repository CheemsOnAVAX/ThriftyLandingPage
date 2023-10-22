module.exports = (app) => {
  const User = require('../app/controllers/user.controller.js');
  const {
    getUserAddress,
    getUser,
  } = require('../middlewares/auth.middleware.js');
  app.get('/userInfo', getUserAddress, User.getUserInfo);
  app.post('/findBySocial', getUserAddress, User.findUserBySocial);
  app.post('/register', getUserAddress, User.RegisterUser);
  app.get('/topUser', User.getTopUserList);
  app.post('/auth/twitter/reverse', User.getTwitterAccessToken);
  app.post('/auth/twitter/', User.twitterAuthVerifier);
  app.post('/auth/get-reddit-user', User.getRedditUser);
  app.get('/search-user', User.searchUser);
  app.post('/auth/verify-social-token', getUserAddress, User.verifySocialToken);
  app.get('/generate-referral-token', getUser, User.generateReferralToken);
  app.get('/referral-users', getUser, User.getMyReferralUsers);
  app.post('/customize-notification', getUser, User.customizeNotification);
  app.post('/register-social-user', getUserAddress, User.registerSocialUser);
  app.post('/check-username', getUserAddress, User.checkUserName);
  app.post('/check-invitation-code', User.checkInvitationCode);
  app.post('/login-social-user', User.socialLogin);
  app.post('/login-social', User.socialLoginWithSocial);
  app.get('/get-encrypted-json', getUser, User.getEncryptedJson);
  app.get('/get-private-key', getUser, User.getPrivateKey);
  app.get('/get-public-user', User.getPublicUserInfo);
  app.get('/search-social-users', getUser, User.searchSocialUsers);
};
