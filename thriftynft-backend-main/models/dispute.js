'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
    trad_id: {
        type: String,
        require: true
    },
    product_id: {
        type: String,
        require: true
    },
    mode: {
        type: String
    },
    key: {
        type: String
    },
    escrow_id: {
        type: String
    },
	reason: {
		type: String
	},
    moderator: {
        type: String
    },
    description: {
        type: String,
    },
    status: {
        type: String,
    }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("Dispute", schema);