const Store = require('../../models/Store');
const PutOnSaleList = require('../../models/PutOnSaleList');
const User = require('../../models/user');

exports.getAllStores = async function (req, res) {
  const owner = req.userAddress;
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  let foundUser;
  let results;
  let total;
  try {
    if (owner) {
      foundUser = await User.findOne({ address: owner });
    }
    if (foundUser) {
      results = await Store.find({
        members: { $nin: [foundUser._id] },
      })
        .limit(limit)
        .skip(skip);
      total = await Store.countDocuments({
        members: { $nin: [foundUser._id] },
      });
    } else {
      results = await Store.find().limit(limit).skip(skip);
      total = await Store.countDocuments();
    }

    // Response
    res.send({
      data: results,
      total,
    });
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.getMyStores = async function (req, res) {
  const owner = req.user;
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  try {
    const results = await Store.find({
      members: { $in: [owner._id] },
    })
      .limit(limit)
      .skip(skip);
    const total = await Store.countDocuments({
      members: { $in: [owner._id] },
    });

    res.send({
      data: results,
      total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.getStore = async function (req, res) {
  const storeId = req.query.storeId;
  const currentUser = req.userAddress;
  let isPending;
  let storeFullData;
  let storeMemberData;
  try {
    const foundStore = await Store.findOne({ _id: storeId });
    let result = await foundStore.populate([
      {
        path: 'members',
        select: ['name', 'address', 'bio', 'avatar'],
      },
    ]);
    if (currentUser && currentUser.length !== 0) {
      const foundUser = await User.findOne({ address: currentUser });
      isPending = foundStore.requests.some((reqMemberId) =>
        reqMemberId.equals(foundUser._id)
      );
      if (foundUser.address === foundStore.owner) {
        storeFullData = await foundStore.populate([
          {
            path: 'members',
            select: ['name', 'address', 'bio', 'avatar'],
          },
          {
            path: 'requests',
            select: ['name', 'address', 'bio', 'avatar'],
          },
        ]);
      }
    }

    result = {
      _id: result._id,
      title: result.title,
      type: result.type,
      details: result.details,
      accentColor: result.accentColor,
      owner: result.owner,
      requests: [],
      members: result.members,
      nfts: result.nfts,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      isPending: isPending,
    };

    // Response
    if (storeFullData) {
      res.send(storeFullData);
      return;
    }
    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.postStore = async function (req, res) {
  const title = req.body.title;
  const type = req.body.type;
  const details = req.body.details;
  const accentColor = req.body.accentColor;
  const currentUser = req.userAddress;
  try {
    const foundUser = await User.findOne({ address: currentUser });

    const newStore = new Store({
      title,
      type,
      details,
      accentColor,
      owner: currentUser,
      members: [foundUser],
    });
    const result = await newStore.save();

    // Response
    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.deleteStore = async function (req, res) {
  const collectionId = req.query.collectionId;
  try {
    res.send('Success');
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.manageStore = async function (req, res) {
  const action = req.query.action;
  const storeId = req.body.storeId;
  const NFTkey = req.body.key;
  const userAddress = req.body.address;
  const currentUser = req.userAddress;
  try {
    const foundStore = await Store.findOne({ _id: storeId });
    let foundNFT;
    let result;
    if (foundStore.owner !== currentUser) {
      throw new Error('Something went wrong!');
    }

    // NFT
    if (NFTkey !== undefined) {
      foundNFT = await PutOnSaleList.findOne({ key: NFTkey });
      if (foundNFT && action === 'add') {
        foundNFT.stores.push(foundStore._id);
        foundStore.nfts.push(NFTkey);
      } else if (foundNFT && action === 'remove') {
        foundNFT.stores = foundNFT.stores.filter(
          (store) => !store.equals(storeId)
        );
        foundStore.nfts = foundStore.nfts.filter((nft) => nft !== NFTkey);
      } else {
        result = foundStore;
      }
      await foundNFT.save();
    }

    // User
    if (userAddress !== undefined) {
      foundUser = await User.findOne({ address: userAddress });
      foundStore.requests = foundStore.requests.filter(
        (request) => !request.equals(foundUser._id)
      );
      if (action === 'approve') {
        foundUser.stores.push(foundStore);
        foundStore.members.push(foundUser);
      } else if (action === 'disprove' && userAddress !== currentUser) {
        if (foundUser.stores) {
          foundUser.stores = foundUser.stores.filter(
            (userStore) => !userStore.equals(foundStore._id)
          );
        }
        if (foundStore.members) {
          foundStore.members = foundStore.members.filter(
            (storeMember) => !storeMember.equals(foundUser._id)
          );
        }
      } else {
        result = foundStore;
      }
      await foundUser.save();
    }

    // Response
    const updatedStore = await foundStore.save();
    result = await updatedStore.populate([
      {
        path: 'members',
        select: ['name', 'address', 'bio', 'avatar'],
      },
      {
        path: 'requests',
        select: ['name', 'address', 'bio', 'avatar'],
      },
    ]);

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.storeUser = async function (req, res) {
  const action = req.query.action;
  const currentUser = req.userAddress;
  const storeId = req.body.storeId;
  try {
    const foundStore = await Store.findOne({ _id: storeId });
    const foundUser = await User.findOne({ address: currentUser });
    let result;
    if (action === 'join') {
      foundStore.requests.push(foundUser);
      updatedStore = await foundStore.save();
      result = {
        _id: updatedStore._id,
        title: updatedStore.title,
        type: updatedStore.type,
        details: updatedStore.details,
        accentColor: updatedStore.accentColor,
        owner: updatedStore.owner,
        requests: updatedStore.requests,
        members: updatedStore.members,
        nfts: updatedStore.nfts,
        createdAt: updatedStore.createdAt,
        updatedAt: updatedStore.updatedAt,
        isPending: true,
      };
    }
    if (action === 'leave') {
      foundUser.stores = foundUser.stores.filter(
        (store) => !store.equals(foundStore._id)
      );
      await foundUser.save();
      foundStore.members = foundStore.members.filter(
        (member) => !member.equals(foundUser._id)
      );
      result = await foundStore.save();
    }
    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};
