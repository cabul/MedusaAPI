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
	match_info: [],
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


matchSchema.methods.getTurns = function(id, turns){
	var query = this.model('Match').findById(id, 'turns', function (err){
		if(err)
			console.log('Could not get turns of match with id: s%', id);
			return handleError(err);
	});
	
	return query.exec(turns);
};

ticketSchema.methods.removeMatch = function (matchId){
	this.model('Match').findByIdAndRemove({ _id: matchId }, function(err) {
    if (!err) {
           return ('Match with id = %s has been removed ', matchId);
    }
    else {
           console.log('Could not remove match with id = %s', matchId) ;
           return handleError(err);
    }
});
	
};

mongoose.model('Match', matchSchema);