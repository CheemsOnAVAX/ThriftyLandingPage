'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
	comment: String,
	product_id: {
		type: String,
		require: true,
	},
    from: {
        type: String,
        require: true
    },
    to: {
        type: String,
        require: true
    }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("Message", schema);