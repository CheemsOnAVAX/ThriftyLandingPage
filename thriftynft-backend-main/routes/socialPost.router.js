module.exports = (app) => {
  const SocialPost = require('../app/controllers/socialPost.controller');
  const {
    getUserAddress,
    getUser,
    getUserAddressNoAuthUser,
  } = require('../middlewares/auth.middleware.js');
  app.post('/add-social-post', getUser, SocialPost.addSocialPost);
  app.post('/add-social-post-like', getUser, SocialPost.addSocialPostLike);
  app.post('/add-social-comment', getUser, SocialPost.addSocialComment);
  app.post(
    '/add-social-comment-like',
    getUser,
    SocialPost.addSocialCommentLike
  );
  app.get('/get-social-posts', getUser, SocialPost.getSocialPosts);
  app.get('/get-my-social-posts', getUser, SocialPost.getMySocialPosts);
  app.get('/get-social-all-comments', getUser, SocialPost.getSocialAllComments);
  app.get('/get-social-comments', getUser, SocialPost.getSocialComments);
  app.post('/delete-my-social-post', getUser, SocialPost.deleteMySocialPost);
  app.get(
    '/get-news-feed-post',
    getUserAddressNoAuthUser,
    SocialPost.getNewsFeedPost
  );
};
