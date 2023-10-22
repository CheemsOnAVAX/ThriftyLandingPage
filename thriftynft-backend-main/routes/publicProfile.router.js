module.exports = (app) => {
  const publicProfile = require("../app/controllers/publicProfile.controller.js");
  const { getUserAddressNoAuth } = require("../middlewares/auth.middleware");
  app.get(
    "/publicProfileAll",
    getUserAddressNoAuth,
    publicProfile.getPublicProfileAll
  );
  app.get(
    "/publicProfile",
    getUserAddressNoAuth,
    publicProfile.getPublicProfile
  );
  app.post(
    "/publicProfile",
    getUserAddressNoAuth,
    publicProfile.postPublicProfile
  );
  app.put(
    "/publicProfile",
    getUserAddressNoAuth,
    publicProfile.putPublicProfile
  );
  // app.get("/publicProfile", publicProfile.getShadow44);
};
