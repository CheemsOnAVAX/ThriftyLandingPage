'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
  key: {
    type: String
  },
  chainId: {
    type: Number,
  },
  taker: {
    type: String
  },
  price: {
    type: String
  },
  saleMode: {
    type: Number
  },
  tokenId: {
    type: String
  },
  amount: {
    type: String
  },
  timeNeeded: {
    type: String
  },
  offer: {
    type: String
  }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("AuctionList", schema);