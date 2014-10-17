'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var usersOnHoldSchema = new Schema({
	userID: {
		type: String,
		required: true,
		unique: true
	},
	elo: {
		type: String,
		required: true,
		unique: false
	}
});

 mongoose.model('UsersOnHold', usersOnHoldSchema);