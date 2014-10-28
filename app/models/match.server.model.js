'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

var matchSchema = new Schema({
	players: [],
	init_date: {
		type: Date,
		required: true,
 		unique: false
	},
	Last_Turn: {
		type: Number,
		required: true,
		unique: false
	},
	turns: [], 
	status: {
		type: String,
		required: true,
		unique: false
	}
});

matchSchema.methods.createMatch = function (userA, userB, match) {
	var newMatch = new this.model('Match') ({
		players: [{player1: userA}, {player2: userB}],
		init_date: new Date(),
		Last_Turn: 0,
		turns: [], 
		status: 'not started'
	});
	newMatch.save(function(err){
		if(err)
			console.log('Could not create new match');
			return handleError(err);
	});
	return newMatch._id;
};

matchSchema.methods.getTurns = function(id, turns){
	var query = this.model('Match').findById(id, 'turns', function (err){
		if(err)
			console.log('Could not get turns of match with id: s%', id);
			return handleError(err);
	});
	
	return query.exec(turns);
};


mongoose.model('Match', matchSchema);