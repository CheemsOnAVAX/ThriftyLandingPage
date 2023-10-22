module.exports = (app) => {
  const PrivateFile = require('../app/controllers/privateFile.controller.js');
  const {
    getUserAddress,
    getUser,
  } = require('../middlewares/auth.middleware.js');
  app.post('/create-private-file', getUser, PrivateFile.createNewPrivateFile);
  app.post('/share-private-file', getUser, PrivateFile.sharePrivateFile);
  app.get('/get-private-files', getUser, PrivateFile.getPrivateFiles);
  app.get('/decrypted-private-file', getUser, PrivateFile.getDecryptedFile);
  app.get('/delete-private-file', getUser, PrivateFile.deletePrivateFile);
};
