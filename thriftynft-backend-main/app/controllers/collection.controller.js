const Collection = require('../../models/collection');

// Retrieve all Customers from the database.
exports.getCollectionByAddress = async (req, res) => {
  const address = req.query.address.toLowerCase();
  try {
    const result = await Collection.find({ owner: address });
    res.send(result);
  } catch (e) {
    //console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.addCollection = async (req, res) => {
  //console.log("=========addCollection==========",req.body)
  const user = req.user;
  const collectionId = req.body.collectionId;
  const chainId = req.body.chainId;
  const category = req.body.category;
  const metadata = req.body.metadata;
  const socials = req.body.socials;
  const tokenId = req.body.tokenId;
  const owner = user.address.toLowerCase();

  try {
    const result = await Collection.findOneAndUpdate(
      { collectionId: collectionId },
      {
        collectionId: collectionId,
        chainId: chainId,
        category: category,
        metadata: metadata,
        socials: socials,
        owner: owner,
        tokenId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error('Create user fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};
