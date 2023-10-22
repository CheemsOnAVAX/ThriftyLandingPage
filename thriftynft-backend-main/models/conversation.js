'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    participants: [
      {
        type: Map,
        of: String,
      },
    ],
    isGroupConversation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('Conversation', schema);
