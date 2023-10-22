const Item = require('../../models/item');
const Putonsale = require('../../models/PutOnSaleList');
const Auction = require('../../models/AuctionList');
const User = require('../../models/user');
const _ = require('lodash');
const item = require('../../models/item');

// Retrieve all Customers from the database.
exports.getItemAll = async (req, res) => {
  try {
    const result = await Item.find();
    res.send(result);
  } catch (e) {
    //console.log("=something went wrong ", e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.getItem = async (req, res) => {
  // const collectionId = req.query.collectionId;
  // const tokenId = req.query.tokenId;
  const maker = req.query.maker;

  try {
    const result = await Item.find({ maker: maker });
    res.send(result);
  } catch (e) {
    //console.log("=something went wrong ", e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.addItem = async (req, res) => {
  //console.log("=========addItem==========",req.body)
  const collectionId = req.body.collectionId;
  const chainId = req.body.chainId;
  const category = req.body.category;
  const subCategory = req.body.subCategory;
  const metadata = req.body.metadata;
  const tokenId = req.body.tokenId;
  const mode = req.body.mode;
  const maker = req.body.maker;
  const tags = req.body.tags;
  const isDispute = req.body.isDispute;

  try {
    const result = new Item({
      collectionId: collectionId,
      chainId: chainId,
      category: category,
      subCategory: subCategory,
      metadata: metadata,
      tokenId: tokenId,
      mode: mode,
      maker: maker,
      tags: tags,
      isDispute: isDispute,
      makerState: true,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error('Create Item fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.toggleFavor = async (req, res) => {
  //console.log("=========addFavor==========",req.body)
  const address = req.body.address;
  const chainId = req.body.chainId;
  const tokenId = req.body.tokenId;
  const collectionId = req.body.collectionId;

  try {
    const result = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    if (!result) res.status(500).send({ message: 'empty item' });
    const fav = result.likes;
    const index = _.indexOf(fav, address);
    index === -1 ? result.likes.push(address) : result.likes.splice(index, 1);
    result.save();
    res.send(index === -1 ? true : false);
  } catch (e) {
    console.error('addFavor fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.isFavor = async (req, res) => {
  //console.log("=========getFavor==========",req.query)
  const chainId = req.query.chainId;
  const tokenId = req.query.tokenId;
  const collectionId = req.query.collectionId;
  const address = req.query.address;

  try {
    const result = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
      likes: address,
    });
    //console.log(result)
    res.send(result ? true : false);
  } catch (e) {
    console.error('getFavor fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.getFavorListByLiker = async (req, res) => {
  const liker = req.query.liker;
  const pageNum = Math.max(0, req.query.page);
  const perPage = 10;

  //console.log("=========getPutonSaleByLikes=========",req.query.liker)
  try {
    const itemList = await Item.find({ likes: liker })
      .limit(perPage)
      .skip(perPage * pageNum);
    const count = await Item.count({ likes: liker });
    let len = itemList.length;
    const putonsale = [];
    for (let i = 0; i < len; i++) {
      const result = await Putonsale.find({
        collectionId: itemList[i].collectionId,
        tokenId: itemList[i].tokenId,
        isAlive: true,
      });
      putonsale.push(result);
    }
    res.send({
      list: itemList,
      putonsale: putonsale,
      page: pageNum,
      count: count,
    });
  } catch (e) {
    //console.log("getPutonSaleByLikes wrong ", e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.finditemstate = async (req, res) => {
  const tokenId = req.query.tokenId;
  const maker = req.query.maker;

  try {
    const result = await Item.findOne({ tokenId: tokenId, maker: maker });
    res.send(result ? result : false);
  } catch (e) {
    console.error('Create Item fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.updateItem = async (req, res) => {
  const collectionId = req.body.collectionId;
  const oldID = req.body.oldID;
  const maker = req.body.maker;
  const makerState = req.body.makerState;

  try {
    const resOne = await Item.findOne({
      collectionId: collectionId,
      tokenId: oldID,
    });

    const result = new Item({
      collectionId: resOne.collectionId,
      chainId: resOne.chainId,
      category: resOne.category,
      subCategory: resOne.subCategory,
      metadata: resOne.metadata,
      tokenId: req.body.newId,
      mode: req.body.mode,
      maker: maker,
      tags: resOne.tags,
      isDispute: resOne.isDispute,
      makerState: makerState,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error('updateItem fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.updateState = async (req, res) => {
  const collectionId = req.body.collectionId;
  const tokenID = req.body.tokenId;
  const maker = req.body.maker;
  const makerState = req.body.makerState;

  console.error('updateState ', req.body);

  try {
    const resOne = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenID,
      maker: maker,
    });
    resOne.makerState = makerState;
    const result = await resOne.save();
    res.send(result);
  } catch (e) {
    console.error('updateItem fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.getItemByTokenId = async (req, res) => {
  try {
    const tokenId = req.query.tokenId;
    const item = await Item.findOne({ tokenId: tokenId });
    res.send(item);
  } catch (error) {
    res.status(500).send({
      message: error || 'Something went wrong!',
    });
  }
};
