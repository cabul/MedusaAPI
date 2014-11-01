'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

var matchSchema = new Schema({
	players: {
			type: Array,
			required: true,
			unique: true
	},
	match_info: {type: Array,
			required: false,
			unique: false,
	},
	init_date: {
		type: Date,
		required: true,
 		unique: false
	},
	turns: {
		type: Array,
		required: true,
		unique: false,
	}, 
	status: {
		type: String,
		required: true,
		unique: false
	}
});

matchSchema.methods.lastTurn = function(){
  return this.turns.length - 1;
};

matchSchema.static.getTurns = function (matchId, turns){
	this.model('Match').findById(matchId, 'turns', function (err, turns){
		if(err){
			console.log('Could not get turns of match with id: s%', matchId);
			return handleError(err);
		}
		return turns;
	});
};

matchSchema.static.removeMatch = function (matchId){
	this.model('Match').findByIdAndRemove(matchId, {}, function(err) {
    if (!err) {
           return ('Match with id = %s has been removed ', matchId);
    }
    else {
           console.log('Could not remove match with id = %s', matchId) ;
           return err;
    }
});
	
};

mongoose.model('Match', matchSchema);