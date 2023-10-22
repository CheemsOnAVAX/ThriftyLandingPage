'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    _key: {
      type: String,
    },
    key: String,
    collectionId: String,
    tokenID: String,
    maker: String,
    taker: String,
    price: String,
    coinType: String,
    Total: String,
    current: String,
    bookingFee: Number,
    bookingDuration: Number,
    bookingDate: String,
    bookingState: Boolean,
    isAlive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('FNFTstate', schema);
