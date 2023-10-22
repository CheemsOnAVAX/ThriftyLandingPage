module.exports = (app) => {
  const Collection = require('../app/controllers/item.controller.js');
  app.get('/getItemAll', Collection.getItemAll);
  app.get('/getItem', Collection.getItem);
  app.get('/getItemByTokenId', Collection.getItemByTokenId);
  app.post('/addItem', Collection.addItem);
  app.post('/updateItem', Collection.updateItem);
  app.post('/updateState', Collection.updateState);
  app.post('/togglefavor', Collection.toggleFavor);
  app.get('/isfavor', Collection.isFavor);
  app.get('/mywhishlist', Collection.getFavorListByLiker);
  app.get('/finditemstate', Collection.finditemstate);
};
