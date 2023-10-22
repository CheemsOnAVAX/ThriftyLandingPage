"use strict";
const User = require("./user");
const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    mainPurpose: {
      required: true,
      type: String,
    },
    shopTitle: String,
    shopDetails: String,
    freelancerTitle: String,
    freelancerDetails: String,
    skills: String,
    languages: {
      required: true,
      type: String,
    },
    country: {
      required: true,
      type: String,
    },
    portfolioLink: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      required: true,
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("PublicProfile", schema);
