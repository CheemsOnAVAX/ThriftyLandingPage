const mongoose = require("mongoose");
const User = require("./user");
const Store = require("./Store");

const postSchema = mongoose.Schema(
  {
    title: String,
    details: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Post", postSchema);
