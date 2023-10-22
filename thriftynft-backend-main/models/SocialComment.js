'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: String,
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialPost',
      required: true,
    },
    images: [String],
    ipfsLink: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialComment',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    hasChildren: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('SocialComment', schema);
