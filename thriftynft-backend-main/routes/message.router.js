module.exports = (app) => {
  const Collection = require('../app/controllers/message.controller.js');

  app.get('/messages', Collection.getMessages);
  app.post('/addMessage', Collection.addMessage);
};
