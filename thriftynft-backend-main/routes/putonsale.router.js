module.exports = (app) => {
  const Putonsale = require('../app/controllers/putonsale.controller.js');
  const { getUserAddressNoAuth } = require('../middlewares/auth.middleware');
  app.get('/getPutonsaleAll', Putonsale.getPutonsaleAll);
  app.get('/getputonsale', Putonsale.getPutonsale);
  app.get('/getputonsalebymaker', Putonsale.getPutonsaleByMaker);
  app.get('/getPutonlistAndAuctionlist', Putonsale.getPutonlist);
  app.post('/putonsale', Putonsale.addPutonsale);
  app.post('/cancelList', Putonsale.cancelList);
  app.post('/updateputonsale', Putonsale.updatePutonSale);
  app.get('/getPutonsalePerPage', Putonsale.getPutonsalePageNum);
  app.get('/getNFTList', getUserAddressNoAuth, Putonsale.getNFTList);
  app.get('/getFNFTPutOnSale', Putonsale.getFNFTPutOnSale);
  // app.get("/getTopPutonsale", Putonsale.getTopPutonsale);
};
