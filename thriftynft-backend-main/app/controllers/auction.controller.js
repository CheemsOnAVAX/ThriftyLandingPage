// const Putonsale = require('../../models/PutOnSaleList')
// const Item = require("../../models/item")
const Auction = require('../../models/AuctionList');
const Item = require('../../models/item');
// const User = require("../../models/user")

exports.addAuctionList = async (req, res) => {
  const key = req.body.key;
  const chainId = req.body.chainId;
  const amount = req.body.amount;
  const price = req.body.price;
  const taker = req.body.taker;
  const timeNeeded = req.body.timeNeeded;
  const offer = req.body.offer;
  const saleMode = req.body.saleMode;
  const tokenId = req.body.tokenId;

  //console.log("addAuction", req.body)

  try {
    const result = await Auction.findOneAndUpdate(
      { key: key, taker: taker },
      {
        chainId: chainId,
        key: key,
        amount: amount,
        taker: taker,
        price: price,
        saleMode: saleMode,
        tokenId: tokenId,
        timeNeeded: timeNeeded,
        offer: offer,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const item = await Item.findOne({ tokenId: tokenId });
    const obj = {
      ...result,
      maker: item.maker,
    };
    res.send(item);
  } catch (e) {
    console.error('Create user fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.cancelBid = async (req, res) => {
  const key = req.body.key;
  const taker = req.body.taker;
  try {
    const result = await Auction.findOneAndDelete({ key: key, taker: taker });
    res.send(result);
  } catch (e) {
    console.error('cancelList fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.findMaxPrice = async (req, res) => {
  const tokenId = req.query.tokenId;
  const saleMode = req.query.saleMode;
  try {
    const result = await Auction.find({ tokenId: tokenId, saleMode: saleMode })
      .sort({ price: -1 })
      .limit(1);
    // console.log('result', result);
    res.send(result);
  } catch (e) {
    console.error('cancelList fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};
