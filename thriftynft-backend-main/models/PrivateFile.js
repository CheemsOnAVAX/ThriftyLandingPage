'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    link: String,
    createdBy: [
      {
        type: Map,
        of: String,
      },
    ],
    name: String,
    size: Number,
    type: String,
    ext: String,
    sharedWith: [
      {
        type: Map,
        of: String,
      },
    ],
    isIpfsLink: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('PrivateFile', schema);
