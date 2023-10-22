const SampleImage = require('../../models/SampleImage');

exports.getSampleImages = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page - 1 || 0;
    let type = req.query.type;
    //type is a array of string
    const result = await SampleImage.find({ type: { $in: type } })
      .limit(limit)
      .skip(page * limit);
    const total = await SampleImage.countDocuments({ type: { $in: type } });
    res.send({ result, total });
  } catch (e) {
    console.error('=something went wrong ', e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.setSampleImages = async (req, res) => {
  const cid = req.body.cid;
  const type = [req.body.type];
  try {
    const result = await SampleImage.findOneAndUpdate(
      { cid: cid },
      {
        cid: cid,
        url: `https://nftstorage.link/ipfs/${cid}`,
        //push type string to array if not exist
        $addToSet: { type: { $each: type } },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error('Create user fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};
