const Reviews = require('../../models/reviews')
const Questions = require('../../models/question')

// Retrieve all Customers from the database.
exports.getReviews = async(req, res) => {
  const product_id = req.query.product_id;
  const perPage = Math.max(0, req.query.limit);
  const pageNum = Math.max(0, req.query.page);
  try{
    const itmCnt = await Reviews.count({product_id: product_id})
    // const result = await Reviews.find({product_id: product_id}).limit(perPage).skip(perPage * pageNum)
    const result = await Reviews.find({product_id: product_id})
		//console.log("data:", result);
    res.send({
			reviews: result, 
			totalCount: itmCnt, 
			current_page: pageNum,
			from: 1,
			last_page: Math.ceil(itmCnt / perPage),
			per_page: perPage,
			to: Math.ceil(itmCnt / perPage),
			total: itmCnt
		})
  } catch(e) {
    //console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || 'Something went wrong!'
    })
  }
}

exports.getReviewsByMaker = async(req, res) => {
	const user_id = req.query.maker;
	try{
	  // const result = await Reviews.find({product_id: product_id}).limit(perPage).skip(perPage * pageNum)
	  const result = await Reviews.find({user_id: user_id})
	  res.send(result)
	} catch(e) {
	  //console.log("=something went wrong ", e);
	  res.status(500).send({
		message: err || 'Something went wrong!'
	  })
	}
  }

exports.addReview = async(req, res) => {
	//console.log("=========addReview==========",req.body)
	const product_id = req.body.product_id;
	const user_id = req.body.user_id;
	const comment = req.body.comment;
	const rating = req.body.rating;
	const photos = req.body.photos;

	try{
		const result = new Reviews(
			{
				product_id: product_id,
				user_id: user_id,
				comment: comment, 
				rating: rating,
				photos: photos
			}
		)
		await result.save()
		res.send(result);
	} catch(e) {
		console.error('Create review fail', e);
		res.status(500).send({message: err || "Something went wrong"});
	}
}

exports.addFeedback = async(req, res) => {
	//console.log("=========addFeedback==========",req.body)
	const id = req.body.model_id;
	const model_type = req.body.model_type
	const positive = req.body.positive;
	const negative = req.body.negative;
	try{
		if ( model_type === 'Review' ) {
			if ( positive ) {
				const result = await Reviews.findOneAndUpdate({_id: id},
					{
						$inc: { "positive_feedbacks_count": 1 }
					},
					{upsert: true, new: true, setDefaultsOnInsert: true}
				);
				res.send(result);
			}
			if ( negative ) {
				const result = await Reviews.findOneAndUpdate({_id: id},
					{
						$inc: { "negative_feedbacks_count": 1 }
					},
					{upsert: true, new: true, setDefaultsOnInsert: true}
				);
				res.send(result);
			}
		} else if ( model_type === 'Question' ){
			if ( positive ) {
				const result = await Questions.findOneAndUpdate({_id: id},
					{
						$inc: { "positive_feedbacks_count": 1 }
					},
					{upsert: true, new: true, setDefaultsOnInsert: true}
				);
				res.send(result);
			}
			if ( negative ) {
				const result = await Questions.findOneAndUpdate({_id: id},
					{
						$inc: { "negative_feedbacks_count": 1 }
					},
					{upsert: true, new: true, setDefaultsOnInsert: true}
				);
				res.send(result);
			}
		}
	} catch(e) {
		console.error('Create review fail', e);
		res.status(500).send({message: err || "Something went wrong"});
	}
}