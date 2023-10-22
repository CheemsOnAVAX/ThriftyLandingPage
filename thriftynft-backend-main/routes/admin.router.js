module.exports = (app) => {
  const adminController = require('../app/controllers/admin.controller.js');
  const { getUserAddress, getUser } = require('../middlewares/auth.middleware');
  // app.get("/admin/nftList", getUserAddress, adminController.getNFTList);
  app.put('/admin/nftList', getUser, adminController.putNFTList);
  app.delete('/admin/nftList', getUserAddress, adminController.deleteNFTList);
  app.get('/admin/users', getUserAddress, adminController.getUsers);
  app.put('/admin/users', getUserAddress, adminController.putUsers);
  app.delete('/admin/users', getUserAddress, adminController.deleteUsers);
};
