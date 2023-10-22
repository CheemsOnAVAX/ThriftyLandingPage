const Questions = require('../../models/question');
const Putonsale = require('../../models/PutOnSaleList');
const User = require('../../models/user');
const Item = require('../../models/item');

// Retrieve all Customers from the database.
exports.getQuestions = async (req, res) => {
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  try {
    const query = { product_id: product_id };
    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }
    const itmCnt = await Questions.count(query);
    const result = await Questions.find(query)
      .populate('user_id', ['name', 'address', '_id'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    //console.log("data:", result);
    res.send({
      data: result,
      totalCount: itmCnt,
      current_page: page,
      from: 1,
      last_page: Math.ceil(itmCnt / limit),
      per_page: limit,
      to: Math.ceil(itmCnt / limit),
      total: itmCnt,
    });
  } catch (e) {
    console.log('=something went wrong ', e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.getMyQuestion = async (req, res) => {
  const user_id = req.query.maker;
  const perPage = Math.max(0, req.query.limit);
  const pageNum = Math.max(0, req.query.page);
  try {
    const itmCnt = await Questions.count({});
    // const result = await Reviews.find({product_id: product_id}).limit(perPage).skip(perPage * pageNum)
    const result = await Questions.find({ user_id: user_id });
    const myQuestionInfo = [];
    for (let i = 0; i < result.length; i++) {
      const product = await Putonsale.findOne({ _id: result[i].product_id });
      if (product) {
        const user = await User.findOne({ address: product.maker }).select([
          'name',
          'avatar',
          'address',
        ]);
        const item = await Item.findOne({
          collectionId: product.collectionId,
          tokenId: product.tokenId,
        });
        myQuestionInfo.push({
          answer: result[i]?.answer,
          my_feedback: result[i]?.my_feedback,
          negative_feedbacks_count: result[i]?.negative_feedbacks_count,
          positive_feedbacks_count: result[i]?.positive_feedbacks_count,
          product_id: result[i]?.product_id,
          question: result[i]?.question,
          product: {
            username: user.name,
            avatar: user.avatar,
            address: user.address,
            collectionLikes: item?.likes,
            metadata: item?.metadata,
            mode: item?.mode,
            key: product.key,
            maker: product.maker,
            chainId: product.chainId,
            tokenId: product.tokenId,
            amount: product.amount,
            royaltyFee: product.royaltyFee,
            admin: product.admin,
            price: product.price,
            endPrice: product.endPrice,
            isFNFT: product.isFNFT,
            _type: product._type,
            fnft_Type: product.fnft_Type,
            category: product.category,
            isAlive: product.isAlive,
            collectionId: product.collectionId,
          },
        });
      }
    }
    // const result = await Questions.aggregate([
    // 	{ "$lookup": {
    // 		"from": "putonsalelists",
    // 		"let": { "id": "$product_id" },
    // 		"pipeline": [
    // 		{ "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
    // 		],
    // 		"as": "product"
    // 	}}
    // ])
    // //console.log("data:", dddd);
    res.send({
      data: myQuestionInfo,
      totalCount: itmCnt,
      current_page: pageNum,
      from: 1,
      last_page: Math.ceil(itmCnt / perPage),
      per_page: perPage,
      to: Math.ceil(itmCnt / perPage),
      total: itmCnt,
    });
  } catch (e) {
    //console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.addQuestion = async (req, res) => {
  //console.log("=========addQuestion==========",req.body)
  const product_id = req.body.product_id;
  const abusive_reports_count = req.body.abusive_reports_count;
  const answer = req.body.answer;
  const my_feedback = req.body.my_feedback;
  const negative_feedbacks_count = req.body.negative_feedbacks_count;
  const positive_feedbacks_count = req.body.positive_feedbacks_count;
  const question = req.body.question;

  try {
    const result = new Questions({
      product_id: product_id,
      user_id: req.user._id,
      abusive_reports_count: abusive_reports_count,
      answer: answer,
      my_feedback: my_feedback,
      negative_feedbacks_count: negative_feedbacks_count,
      positive_feedbacks_count: positive_feedbacks_count,
      question: question,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error('Create question fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.addAnswer = async (req, res) => {
  const questionId = req.body.questionId;
  const answer = req.body.answer;
  try {
    const question = await Questions.findOne({ _id: questionId });
    if (question) {
      question.answer = answer;
      await question.save();
      await question.populate('user_id', ['name', 'address', '_id']);
      res.send(question);
    } else {
      res.status(500).send('Question not found');
    }
  } catch (e) {
    console.error('Create answer fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.addFeedBack = async (req, res) => {
  const questionId = req.body.questionId;
  try {
    let question = await Questions.findOne({ _id: questionId });
    if (question) {
      const userId = req.user._id;
      question.positive_feedbacks = question.positive_feedbacks || [];
      question.negative_feedbacks = question.negative_feedbacks || [];
      if (question?.positive_feedbacks?.indexOf(userId) >= 0) {
        question.positive_feedbacks.splice(
          question.positive_feedbacks.indexOf(userId),
          1
        );
      }
      if (question?.negative_feedbacks?.indexOf(userId) >= 0) {
        question.negative_feedbacks.splice(
          question.negative_feedbacks.indexOf(userId),
          1
        );
      }
      if (req.body.feedback === 'positive') {
        question.positive_feedbacks.push(userId);
      } else if (req.body.feedback === 'negative') {
        question.negative_feedbacks.push(userId);
      }
      await question.populate('user_id', ['name', 'address', '_id']);
      await question.save();
      res.send(question);
    }
  } catch (e) {
    console.error('Create answer fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};
