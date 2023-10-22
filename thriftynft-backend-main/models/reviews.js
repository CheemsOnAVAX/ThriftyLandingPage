'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
	comment: String,
	rating: Number,
	photos: [String],
	negative_feedbacks_count: Number,
	positive_feedbacks_count: Number,
	my_feedback: String,
	product_id: {
		type: String,
		require: true,
	},
	user_id: {
		type: String,
		require: true,
	},
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("Reviews", schema);