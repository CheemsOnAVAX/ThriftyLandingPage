module.exports = (app) => {
  const { getUser } = require('../middlewares/auth.middleware.js');
  const Collection = require('../app/controllers/collection.controller.js');
  app.get('/getCollection', Collection.getCollectionByAddress);
  app.post('/addCollection', getUser, Collection.addCollection);
};
