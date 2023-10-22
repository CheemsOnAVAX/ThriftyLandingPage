const Activity = require('../../models/Activity');
const Putonsale = require('../../models/PutOnSaleList');
const Item = require('../../models/item');
const User = require('../../models/user');
const {
  sendSocketNotification,
} = require('../../utils/sendSocketNotification');
const { handleAddActivity } = require('./activity.controller');

/* NFT Management */

exports.putNFTList = async (req, res) => {
  const key = req.body.key;
  const featurePriority = req.body.featurePriority;
  const isShadowListed = req.body.isShadowListed;
  const currentUser = req.body.user;
  try {
    // Authorization
    const userData = await User.findOne({ address: req.user.address });
    if (userData.accessLevel < 0) {
      throw new Error('Unauthorized Access!');
    }

    // Original Task
    const resOne = await Putonsale.findOne({ key: key });
    if (featurePriority !== undefined) {
      resOne.featurePriority = featurePriority;
    } else if (isShadowListed !== undefined) {
      resOne.isShadowListed = isShadowListed;
    } else {
      res.send(resOne);
    }
    const result = await resOne.save();

    const user = await User.findOne({ address: result.maker }).select([
      'name',
      'avatar',
      'address',
    ]);

    const item = await Item.findOne({
      collectionId: result.collectionId,
      tokenId: result.tokenId,
    });
    if (featurePriority !== undefined && !isShadowListed) {
      try {
        const obj = {
          activityType: 'newFeaturedNft',
          collectionId: result.collectionId,
          key: result.key,
          isAllReceiver: true,
          tokenId: result.tokenId,
        };

        await handleAddActivity(obj, req.user);
      } catch (error) {
        console.log(error);
      }
    }
    // Response
    res.send({
      username: user.name,
      avatar: user.avatar,
      address: user.address,
      collectionLikes: item?.likes,
      metadata: item?.metadata,
      mode: item?.mode,
      key: result.key,
      maker: result.maker,
      chainId: result.chainId,
      tokenId: result.tokenId,
      amount: result.amount,
      amountInitial: result.amountInitial,
      amountSold: result.amountSold,
      royaltyFee: result.royaltyFee,
      admin: result.admin,
      coinType: result.coinType,
      expDate: result.expDate,
      price: result.price,
      endPrice: result.endPrice,
      isFNFT: result.isFNFT,
      _type: result._type,
      saleMode: result.saleMode,
      category: result.category,
      isAlive: result.isAlive,
      collectionId: result.collectionId,
      featurePriority: result.featurePriority,
      createdAt: result.createdAt,
      isShadowListed: result.isShadowListed,
    });
  } catch (err) {
    console.error('Updating NFT failed!', err);
    res.status(500).send({ message: 'Something went wrong!' });
  }
};

exports.deleteNFTList = async (req, res) => {
  const key = req.body.key;
  try {
    // Authorization
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel < 0) {
      throw new Error('Unauthorized Access!');
    }

    // Original Task
    const resOne = await Putonsale.findOneAndDelete({ key: key });
    const resTwo = await Item.findOneAndDelete({ tokenId: resOne.tokenId });

    // Response
    res.send(resOne);
  } catch (err) {
    console.error('Deleting NFT failed!', err);
    res.status(500).send({ message: 'Something went wrong!' });
  }
};

/* Users Management */

exports.getUsers = async (req, res) => {
  const page = Math.max(0, req.query.page || 1) - 1;
  const perPage = req.query.perPage || 10;
  const filter = req.query.filter;
  const sort = req.query.sort;

  let query = {};
  let sortQuery = {
    createdAt: -1,
  };

  // Sorting
  if (sort === 'createdAt') {
    sortQuery.createdAt = 1;
  }

  // Filter
  if (filter === 'shadowListedOnly') {
    query.isShadowListed = true;
  }
  if (filter === 'adminOnly') {
    query.accessLevel = { $gt: 0 };
    sortQuery.accessLevel = -1;
  }

  try {
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel < 0) {
      throw new Error('Unauthorized Access!');
    }

    const userCount = await User.countDocuments({ ...query });

    const result = await User.find({ ...query })
      .sort(sortQuery)
      .skip(perPage * page)
      .limit(perPage);

    res.send({
      data: result,
      perPage: perPage,
      page: page + 1,
      total: userCount,
      lastPage: Math.floor(userCount / perPage),
    });
  } catch (err) {
    console.error('Getting Users failed!', err);
    res.status(500).send({ message: 'Something went wrong!' });
  }
};

exports.putUsers = async (req, res) => {
  const address = req.body.address;
  const accessLevel = req.body.accessLevel;
  const isShadowListed = req.body.isShadowListed;

  try {
    // Authorization
    const userData = await User.findOne({
      address: req.userAddress.toLowerCase(),
    });
    const resUser = await User.findOne({ address: address });

    if (
      userData.accessLevel < resUser.accessLevel ||
      userData.accessLevel < accessLevel
    ) {
      throw new Error('Unauthorized Access!');
    }

    // Original Task
    if (accessLevel !== undefined) {
      resUser.accessLevel = accessLevel;
    }
    if (isShadowListed !== undefined) {
      resUser.isShadowListed = isShadowListed;
      const PutOnSaleItems = await Putonsale.updateMany(
        { maker: address, isShadowListed: !isShadowListed },
        { $set: { isShadowListed: isShadowListed } },
        { multi: true }
      );
    }
    const result = await resUser.save();

    // Response
    res.send(result);
  } catch (err) {
    console.error('Updating User failed!', err);
    res.status(500).send({ message: 'Something went wrong!' });
  }
};

/*
exports.setAccessLevel = async (req, res) => {
  const address = req.body.address;
  const accessLevel = req.body.accessLevel;

  try {
    const userData = await User.findOne({ address: req.userAddress });
    const resUser = await User.findOne({ address: address });

    if (
      userData.accessLevel < resUser.accessLevel ||
      userData.accessLevel < accessLevel
    ) {
      throw new Error("Unauthorized Access!");
    }

    resUser.accessLevel = accessLevel;
    const result = await resUser.save();
    res.send(result);
  } catch (err) {
    console.error("Setting User AccessLevel failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.shadowListUser = async (req, res) => {
  const address = req.body.address;

  try {
    const userData = await User.findOne({ address: req.userAddress });
    const resUser = await User.findOne({ address: address });

    if (userData.isShadowListed || userData.accessLevel < resUser.accessLevel) {
      throw new Error("Unauthorized Access!");
    }

    const currentShadowListStatus = resUser.isShadowListed;
    resUser.isShadowListed = !currentShadowListStatus;

    const result = await resUser.save();
    const PutOnSaleItems = await Putonsale.updateMany(
      { maker: address, isShadowListed: currentShadowListStatus },
      { $set: { isShadowListed: !currentShadowListStatus } },
      { multi: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Shadow Listing User failed", err);
    res.status(500).send({ message: "Something went wrong" });
  }
};
*/

exports.deleteUsers = async (req, res) => {
  const address = req.body.address.toLowerCase();

  try {
    // Authorization
    const userData = await User.findOne({
      address: req.userAddress.toLowerCase(),
    });
    const resUser = await User.findOne({ address: address });

    if (userData.accessLevel < resUser.accessLevel) {
      throw new Error('Unauthorized Access!');
    }

    // Original Task
    const result = await resUser.deleteOne({ address: address });
    const PutOnSaleToDelete = await Putonsale.deleteMany({
      maker: address,
    });
    const ItemToDelete = await Item.deleteMany({
      maker: address,
    });

    // Response
    res.send(result);
  } catch (err) {
    console.error('Banning User failed!', err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};
