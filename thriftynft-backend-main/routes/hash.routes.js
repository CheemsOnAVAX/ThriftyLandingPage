const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (app) => {
  const lib = require('../app/controllers/hash.controller.js');
  app.post('/encrypt', upload.single('file'), lib.encrypt);
  app.post('/decrypt', lib.decrypt);
  app.post('/encrypt-string', lib.encryptString);
};
