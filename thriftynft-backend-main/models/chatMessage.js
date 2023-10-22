'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    sender: {
      type: Map,
      of: String,
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('ChatMessage', schema);
