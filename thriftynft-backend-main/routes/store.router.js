module.exports = (app) => {
  const StoreController = require('../app/controllers/store.controller.js');
  const {
    getUserAddress,
    getUserAddressNoAuth,
    getUser,
  } = require('../middlewares/auth.middleware');
  app.get('/stores', getUserAddressNoAuth, StoreController.getAllStores);
  app.get('/my-stores', getUser, StoreController.getMyStores);
  app.get('/store', getUserAddressNoAuth, StoreController.getStore);
  app.post('/store', getUserAddress, StoreController.postStore);
  app.delete('/store', getUserAddress, StoreController.deleteStore);
  app.post('/store-manage', getUserAddress, StoreController.manageStore);
  app.post('/store-user', getUserAddress, StoreController.storeUser);
};
