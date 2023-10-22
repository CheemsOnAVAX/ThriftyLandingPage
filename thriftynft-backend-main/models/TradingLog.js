'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  _key: {
    type: String
  },
  income: {
    type: String,
  },
  taker: {
    type: String
  },
  maker: {
    type: String
  },
  price: {
    type: String
  },
  amount: {
    type: String
  },
  royaltyAmount: {
    type: String
  },
  royaltyAdmin: {
    type: String
  },
  collectionId : String,
  tokenId : String,
  isClaim: {
    type: Boolean,
    default: false
  },
  isFNFT: {
    type: Boolean,
    default: false
  },
  escrowID: {
    type: String
  },
  status: {
    type: String,
    default: 'active'
  }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("TradingLog", schema);