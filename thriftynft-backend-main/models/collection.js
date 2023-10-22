'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    collectionId: {
      type: String,
      require: true,
      unique: true,
    },
    owner: {
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
    metadata: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    socials: {
      type: Map,
      of: String,
    },
    likes: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('Collection', schema);
