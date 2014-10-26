'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

var turnSchema = new Schema({
	_match: {type: Schema.Types.ObjectId, ref: 'Match'},
	_ticket: {type: Schema.Types.ObjectId, ref: 'Ticket'},
	info: {},
	num_turn: {
		type: Number,
		required: true,
		unique: false
	}
});

 mongoose.model('Turn', turnSchema);