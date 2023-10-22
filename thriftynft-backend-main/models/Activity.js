'use strict';

const mongoose = require('mongoose');

const activitySchema = mongoose.Schema(
  {
    activityType: {
      type: String,
    },
    sender: {
      type: Map,
      of: String,
    },
    receiver: {
      type: Map,
      of: String,
    },
    isAllReceiver: {
      type: Boolean,
      default: false,
    },
    chatMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gift',
    },
    giftAmount: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tokenId: {
      type: String,
    },
    collectionId: {
      type: String,
    },
    nftBuyer: {
      type: Map,
      of: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    key: {
      type: String,
    },
    feedbackType: {
      type: String,
    },
    isWishListed: {
      type: Boolean,
    },

    store: {
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
      },
      owner: {
        type: String,
      },
      isStoreApproved: {
        type: Boolean,
      },
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model('Activity', activitySchema);
