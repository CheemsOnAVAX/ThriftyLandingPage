'use strict';

const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    abusive_reports_count: Number,
    answer: {},
    my_feedback: String,
    negative_feedbacks: {
      type: [String],
      default: [],
    },
    positive_feedbacks: {
      type: [String],
      default: [],
    },

    product_id: {
      type: String,
    },
    question: String,
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = new mongoose.model('Questions', schema);
