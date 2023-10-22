module.exports = (app) => {
  const SampleImages = require('../app/controllers/sampleImages.controller.js');
  app.get('/sample-images', SampleImages.getSampleImages);
  app.post('/set-sample-images', SampleImages.setSampleImages);
};
