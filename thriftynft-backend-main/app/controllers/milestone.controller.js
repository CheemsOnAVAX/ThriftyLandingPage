const Milestone = require('../../models/milestone')

// Retrieve all Customers from the database.
exports.getMilestones = async(req, res) => {
	//console.log("milestone:", req.query);
	const item_id =req.query.item_id;
	const perPage = 12;
	const pageNum = Math.max(0, req.query.page);
  try{
		const itmCnt = await Milestone.count({item_id: item_id})
    const result = await Milestone.find({item_id: item_id})
		//console.log("data:", result);
    res.send({
			data: result, 
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

exports.addMilestone = async(req, res) => {
    //console.log("milestone:", req.body);
	const item_id = req.body.item_id;
	const milestones = req.body.milestone;
	try{
		for(let i=0; i<milestones?.length; i++){
			const result = new Milestone(
				{
					item_id: item_id,
					phases: milestones[i].phases,
					description: milestones[i].description,
					status: null
				}
			)
			await result.save()
		}
		res.send("ok");
	} catch(e) {
		console.error('create Milestone fail', e);
		res.status(500).send({message: err || "Something went wrong"});
	}
}

exports.updateMilestone = async(req, res) => {
  const id = req.body.id;
  const status = req.body.status;
  const payment = req.body.payment;
  const isClaim = req.body.isClaim;
  try{
    const resOne = await Milestone.findOne({_id:id});
		if(status){
    	resOne.status = status;
		}
		if(payment) {
    	resOne.payment = payment;
		}
		if(isClaim){
			resOne.isClaim = isClaim;
		}
    const result = await resOne.save();
    res.send(result);
  } catch(e) {
    console.error('update fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}
