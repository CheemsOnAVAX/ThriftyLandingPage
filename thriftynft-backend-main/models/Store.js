"use strict";

const mongoose = require("mongoose");
const User = require("./user");

const schema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      require: true,
    },
    details: {
      type: String,
      require: true,
    },
    accentColor: {
      type: String,
    },
    owner: {
      type: String,
      require: true,
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    nfts: [String],
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Store", schema);
