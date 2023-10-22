'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialConversation',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('SocialChatMessage', schema);
