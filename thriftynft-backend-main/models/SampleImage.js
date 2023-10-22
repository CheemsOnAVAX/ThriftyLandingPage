'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    cid: String,
    url: String,
    type: [String],
  },
  { timestamps: true }
);

module.exports = new mongoose.model('SampleImage', schema);
