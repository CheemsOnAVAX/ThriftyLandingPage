const FNFTstate = require("../../models/FNFTstate")
const PutOnSaleList = require('../../models/PutOnSaleList')
const Item = require('../../models/item')
const TradingLog = require("../../models/TradingLog")


exports.addFNFTstate = async (req, res) => {
  const key = req.body.key;
  const tokenID = req.body.tokenId;
  const collectionId = req.body.collectionId;
  const maker = req.body.maker;
  const price = req.body.price;
  const Total = req.body.Total;
  const current = req.body.current;
  const bookingFee = req.body.bookingFee;
  const bookingDuration = req.body.bookingDuration;
  const coinType = req.body.coinType;
  // console.log('----addFNFTsate------', req.body);

  try {
    const result = await FNFTstate.findOneAndUpdate(
      {
        key: key, tokenID: tokenID, maker: maker
      },
      {
        key: key,
        tokenID: tokenID,
        collectionId: collectionId,
        maker: maker,
        price: price,
        coinType: coinType,
        Total: Total,
        current: current,
        bookingFee: bookingFee,
        bookingDuration: bookingDuration,
        bookingState: false,
        isAlive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error('Create user fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.updateFNFTstate = async (req, res) => {
  const key = req.body.key;
  try {
    const resOne = await FNFTstate.findOne({ key: key })
    const resListOne = await PutOnSaleList.findOne({ key: key })
    if(Number(req.body.current) == Number(resOne.Total))
    {
      resListOne.isAlive = false;
      const tmp = await resListOne.save()
    }
    resOne.current = req.body.current;
    const result = await resOne.save()
    res.send(result);
  } catch (e) {
    console.error('updateFNFTstate fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.Booking = async (req, res) => {
  const key = req.body.key;
  const taker = req.body.taker;
  const currentTime = new Date();
  const bookingDate = currentTime.toLocaleString();

  try {
    const resOne = await FNFTstate.findOne({ key: key })
    resOne.bookingDate = bookingDate;
    resOne.bookingState = true;
    resOne.taker = taker;
    const result = await resOne.save()
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.getFNFTstate = async (req, res) => {
  const key = req.query.key;
  const tokenID = req.query.tokenID;
  const currentTime = new Date();
  
  try {
    const result = await FNFTstate.find({ key: key, tokenID: tokenID })

    const expdate = new Date(result[0]['bookingDate']);
    const procDay = (currentTime - expdate) / 1000 / 24 / 3600;

    res.send({
      result: result,
      procDay: Math.floor(procDay),
    })
    // console.log(result)
  } catch (e) {
    res.status(500).send({
      message: e || 'Something went wrong!'
    })
  }
};

exports.cancelFNFTstate = async (req, res) => {
  const key = req.body.key;
  try {
      const resOne = await FNFTstate.findOne({ key: key });
      resOne.isAlive = false;
      const result = await resOne.save();
      res.send(result);
  } catch (e) {
    console.error('cancelFNFTstate fail', e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
}

exports.getFNFTList = async (req, res) => {
  const collectionId = req.query.collectionId;
  const maker = req.query.maker;
  try {
    const result = await PutOnSaleList.aggregate([
      { 
        "$match": { "collectionId": collectionId, 
                  "maker": maker,
                  "isCancel": false,
                  "isFNFT": true,
                } 
      }, 
      { "$lookup": {"from": "items",
                  "localField": "tokenId",
                  "foreignField": "tokenId",
                  "as": "items" } },
      ])
    res.send(result);
  } catch (e) {
    console.error('getFNFTList fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.getFNFTPuchase = async (req, res) => {
  const collectionId = req.query.collectionId;
  const taker = req.query.taker;

  try {
    const result = await FNFTstate.aggregate([
      { 
        "$match": { "collectionId": collectionId, 
                  "taker": taker,
                  "isAlive": true,
                } 
      }, 
      { "$lookup": {"from": "items",
                  "localField": "tokenID",
                  "foreignField": "tokenId",
                  "as": "items" } },
      { "$lookup": {"from": "putonsalelists",
                  "localField": "tokenID",
                  "foreignField": "tokenId",
                  "as": "putonsalelists" } },
      { 
        "$match": { "items.mode": 1} 
      },
    ])
    res.send(result);
  } catch (e) {
    console.error('getFNFTPuchase fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};