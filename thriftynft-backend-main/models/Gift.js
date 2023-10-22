'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    _key: {
      type: String,
    },
    tokenID: String,
    sendsocial: {
      type: Map,
      of: String,
    },

    recvsocial: {
      type: Map,
      of: String,
    },
    maker: String,
    recipient: String,
    coinType: String,
    price: String,
    expdate: Number,
    createdate: String,
    isClaim: Boolean,
    state: Boolean,
    sentFrom: String,
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('Gift', schema);
