'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

var turnSchema = new Schema({
	/*_player: {type: Schema.Types.ObjectId, ref: 'Player'},*/
	_match: {type: Schema.Types.ObjectId, ref: 'Match'},
	currenPlayer: {
		type: String,
		required: true,
		unique: false
	}, //booleano: 0 o 1
	state: {
		type: String,
		required: true,
		unique: false
	},
	num: {
		type: String,
		required: true,
		unique: false
	}
	});


  mongoose.model('Turn', turnSchema);