'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isGroupConversation: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('SocialConversation', schema);
