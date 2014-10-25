'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

var matchSchema = new Schema({
	userA: {
		type: String,
		required: true,
		unique: false
	},
	userB: {
		type: String,
		required: true,
		unique: false
	},
	init_date: {
		type: Date,
		required: true,
 		unique: false
	},
	turnCount: {
		type: String,
		required: true,
		unique: false
	},
	states: [], 
	status: {
		type: String,
		required: true,
		unique: false
	}
});

matchSchema.methods.matchStatus = function () {
	var query = this.model('Match')
		.find({_id: this.id});
   
    return query.only('status');
};


mongoose.model('Match', matchSchema);