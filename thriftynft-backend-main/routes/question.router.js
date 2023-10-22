module.exports = (app) => {
  const Collection = require('../app/controllers/question.controller.js');
  const { getUser } = require('../middlewares/auth.middleware.js');
  app.get('/questions', Collection.getQuestions);
  app.post('/add_questions', getUser, Collection.addQuestion);
  app.get('/my-questions', getUser, Collection.getMyQuestion);
  app.post('/add-feedback', getUser, Collection.addFeedBack);
  app.post('/add-answer', getUser, Collection.addAnswer);
};
