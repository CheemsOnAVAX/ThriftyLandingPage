// const Item = require("../../models/item")
// const Auction = require("../../models/AuctionList")
// const User = require("../../models/user")
const Putonsale = require('../../models/PutOnSaleList')
const Trading = require("../../models/TradingLog")

exports.addLog = async(req, res) => {
  const key = req.body.key;
  const amount = req.body.amount
  const income = req.body.income
  let maker = req.body.maker;
  const price = req.body.price
  const royaltyAmount = req.body.royaltyFee
  const taker = req.body.taker;
  const royaltyAdmin = req.body.royaltyOwner
  const collectionId = req.body.collectionId
  const tokenId = req.body.tokenId
  const escrowID = req.body.escrowID
  const isFNFT = req.body.isFNFT

  try{
    if(maker == ''){
      const result = await Putonsale.find({tokenId: tokenId});
      maker = result[0]['maker'];
    }

    const result = new Trading(
      {
        amount:amount,
        key:key,
        income:income, 
        taker:taker, 
        price: price,
        maker: maker,
        royaltyAmount: royaltyAmount,
        royaltyAdmin: royaltyAdmin,
        collectionId: collectionId,
        tokenId: tokenId,
        escrowID: escrowID,
        isFNFT: isFNFT
      }
    )
    await result.save()
    res.send(result);
  } catch(e) {
    console.error('Create user fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}

exports.getLogs = async(req, res) => {
  const maker = req.query.maker;
  const taker = req.query.taker;
  try{
    if(maker){
      const result = await Trading.find({maker: maker});
      res.send(result);
    }
    if(taker){
      const result = await Trading.find({taker: taker});
      res.send(result);
    }
  } catch(e) {
    console.error('get logs fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}

exports.updateLog = async(req, res) => {
  //console.log("req:", req.body)
  const log_id = req.body.log_id;
  const isClaim = req.body.isClaim;
  const status = req.body.status;

  try{
    const resOne = await Trading.findOne({_id:log_id})
    if(isClaim){
      resOne.isClaim = isClaim
    }
    if(status){
      resOne.status = status
    }
    const result = await resOne.save()
    res.send(result);
  } catch(e) {
    console.error('update logs fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}

exports.cancelBid = async(req, res) => {
  
  try{

  } catch(e) {
    console.error('cancelList fail', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}

exports.deleteNFNTlog = async(req, res) => {
  
  const collectionId = req.body.collectionId;
  const taker = req.body.taker;
  const tokenId = req.body.tokenId;

  try{
    const result = await Trading.deleteMany({collectionId:collectionId, taker:taker, tokenId:tokenId, isFNFT:true})
    res.send(result);
  } catch(e) {
    console.error('tradingFNT del error', e);
    res.status(500).send({message: err || "Something went wrong"});
  }
}
