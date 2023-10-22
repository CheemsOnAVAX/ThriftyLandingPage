'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    address: {
      type: String,
    },
    name: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
    },
    bio: {
      type: String,
      default:
        'I make art with the simple goal of giving you something pleasing to look at for a few seconds.',
    },
    avatar: [String],
    socials: {
      type: Map,
      of: String,
    },
    followers: [String],
    lastActive: Date,
    reputation: {
      type: Number,
      default: 0,
    },
    accessLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    isShadowListed: {
      type: Boolean,
      default: false,
    },
    isSocialVerified: {
      type: Boolean,
      default: false,
    },
    defaultHandler: {
      type: String,
      default: 'address',
    },
    referralToken: {
      type: String,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notificationType: {
      type: Array,
      default: [
        'gift',
        'buyPublicNft',
        'bookNft',
        'addAuction',
        'addQuestionNft',
        'addFeedbackNft',
        'addAnswerNft',
        'addedToWishlist',
        'storeMemberJoinRequest',
        'storeMemberJoinRequestApproved',
        'importantServiceNft',
        'claimGift',
        'newFeaturedNft',
        'expiredGift',
      ],
    },
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
      },
    ],
    gender: {
      type: String,
    },
    userRealName: {
      type: String,
    },
    userBanner: [String],
    metamaskWalletAddress: {
      type: String,
    },
    password: {
      type: String,
    },
    encryptedJson: {
      type: String,
    },
    isMintedNft: {
      type: Boolean,
      default: false,
    },
    nftTokenId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model('User', schema);
