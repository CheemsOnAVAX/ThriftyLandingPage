module.exports = (app) => {
  const categoryController = require('../app/controllers/category.controller.js');
  const { getUserAddress } = require('../middlewares/auth.middleware');
  app.get('/category', categoryController.getCategory);
  app.post('/category', getUserAddress, categoryController.postCategory);
  app.put('/category', getUserAddress, categoryController.putCategory);
  // app.put("/category", categoryController.getCategory);
  app.delete('/category', getUserAddress, categoryController.deleteCategory);
};
