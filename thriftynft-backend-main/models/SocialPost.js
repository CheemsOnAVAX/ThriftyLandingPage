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
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    images: [String],
    ipfsLink: String,
    isPublicComment: {
      type: Boolean,
      default: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
    },
    tags: [String],
    videos: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('SocialPost', schema);
