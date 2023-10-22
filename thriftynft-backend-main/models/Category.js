"use strict";

const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    label: String,
    isServiceCategory: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Category", categorySchema);
