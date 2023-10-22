'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    collectionId: {
      type: String,
      require: true,
    },
    chainId: {
      type: Number,
    },
    category: {
      type: String,
      default: 'Art',
    },
    subCategory: {
      type: String,
      default: 'Art',
    },
    metadata: {
      type: String,
    },
    tags: [
      {
        type: Map,
        of: String,
      },
    ],
    likes: [String],
    tokenId: {
      type: String,
    },
    mode: {
      type: Number,
      default: 0,
    },
    isImported: {
      type: Boolean,
      default: true,
    },
    maker: {
      type: String,
    },
    _type: {
      type: String,
      default: 'nft1155',
    },
    isDispute: {
      type: Boolean,
      default: true,
    },
    makerState: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('Item', schema);
