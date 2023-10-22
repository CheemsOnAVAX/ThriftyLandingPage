'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
    item_id: {
        type: String,
        require: true
    },
	description: {
		type: String
	},
    phases: {
        type: String,
    },
    status: {
        type: String,
        default: 'notStarted'
    },
    payment: {
        type: String,
        default: 'Not relased yet'
    },
    isClaim: {
        type: Boolean,
        default: false
    }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("Milestone", schema);