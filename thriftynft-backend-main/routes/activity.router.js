module.exports = (app) => {
  const Activity = require('../app/controllers/activity.controller.js');
  const {
    getUser,
    getUserAddress,
  } = require('../middlewares/auth.middleware.js');
  app.post('/activity', getUser, Activity.addActivity);
  app.get('/activity', getUser, Activity.getActivity);
  app.get('/activity/readAll', getUser, Activity.activityRead);
};
