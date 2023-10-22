const Dispute = require('../../models/dispute')

// Retrieve all Customers from the database.
exports.getDisputes = async(req, res) => {
    //console.log("========================:", req.body);
		const perPage = Math.max(0, req.query.limit);
		const pageNum = Math.max(0, req.query.page);
  try{
		const itmCnt = await Dispute.count()
		const result = await Dispute.aggregate([
			{ "$lookup": {
					"from": "items",
					"let": { "id": "$product_id" },
					"pipeline": [
					{ "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
					],
					"as": "item"
				}
			},
			{ "$lookup": {
					"from": "tradinglogs",
					"let": { "id": "$trad_id" },
					"pipeline": [
					{ "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
					],
					"as": "trad"
				}
			}
		])
    // const result = await Dispute.find()
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

exports.addDispute = async(req, res) => {
    //console.log("disputes:", req.body);
	const trad_id = req.body.trad_id;
	const product_id = req.body.product_id;
	const mode = req.body.mode;
	const key = req.body.key;
	const escrow_id = req.body.escrow_id;
	const reason = req.body.reason;
	const moderator = req.body.moderator;
	const description = req.body.description;

	try{
		const result = new Dispute(
			{
				trad_id: trad_id,
				product_id: product_id,
				mode: mode,
				key: key,
				escrow_id: escrow_id,
				reason: reason,
				moderator: moderator, 
				description: description
			}
		)
		await result.save()
		res.send(result);
	} catch(e) {
		console.error('create dispute fail', e);
		res.status(500).send({message: err || "Something went wrong"});
	}
}

exports.updateDispute = async(req, res) => {
  const id = req.body.id;
  const status = req.body.resolution;
  try{
    const resOne = await Dispute.findOne({_id:id})
    resOne.status = status
    const result = await resOne.save()
    res.send(result);
  } catch(e) {
    console.error('update fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}
