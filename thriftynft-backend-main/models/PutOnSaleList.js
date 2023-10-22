"use strict";

const mongoose = require("mongoose");
const Store = require("./Store");

const schema = mongoose.Schema(
  {
    name: String,
    description: String,
    key: {
      type: String,
    },
    collectionId: {
      type: String,
      require: true,
    },
    maker: {
      type: String,
      require: true,
    },
    chainId: {
      type: Number,
    },
    tokenId: {
      type: String,
    },
    amountInitial: Number,
    amount: Number,
    amountSold: {
      type: Number,
      default: 0,
    },
    royaltyFee: Number,
    admin: String,
    price: String,
    endPrice: String,
    coinType: String,
    saleMode: Number,
    expDate: Number,
    isFNFT: Boolean,
    _type: String,
    category: String,
    isAlive: Boolean,
    isCancel: Boolean,
    isClaim: Boolean,
    tags: {
      type: Map,
      of: String,
    },
    featurePriority: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },
    isShadowListed: {
      type: Boolean,
      default: false,
    },
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
  },
  { timestamps: true }
);

schema.pre("save", function (next) {
  this.amountSold = this.amountInitial - this.amount;
  next();
});

module.exports = new mongoose.model("PutOnSaleList", schema);
