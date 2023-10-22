const {
  getUserAddress,
  getUser,
} = require('../middlewares/auth.middleware.js');

module.exports = (app) => {
  const GIFT = require('../app/controllers/gift.controller.js');
  app.get('/getSentGift', getUser, GIFT.getSentGift);
  app.get('/getReceivedGift', getUser, GIFT.getReceivedGift);
  app.get('/getSocialGift', GIFT.getSocialGift);
  app.post('/UpdateGift', GIFT.updateGift);
  app.post('/AddGift', GIFT.addGift);
  app.post('/CancelGift', GIFT.cancelGift);
  app.get('/findAddressBySocial', GIFT.findAddressBySocial);
  app.post('/claimGift', getUserAddress, GIFT.claimGift);
  app.get('/checkExpiredGift', getUser, GIFT.checkExpiredGift);
};
