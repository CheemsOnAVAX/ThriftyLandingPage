module.exports = (app) => {
  const PostController = require("../app/controllers/post.controller.js");
  const {
    getUserAddress,
    getUserAddressNoAuth,
  } = require("../middlewares/auth.middleware");
  app.get("/store-post", getUserAddressNoAuth, PostController.getGroupPosts);
  app.post("/store-post", getUserAddress, PostController.postGroupPosts);
  app.delete("/store-post", getUserAddress, PostController.deleteGroupPosts);
};
