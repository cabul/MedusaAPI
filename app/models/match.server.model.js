'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

var matchSchema = new Schema({
	Ticket_userA: {
		type: String,
		required: true,
		unique: true
	},
	ticket_userB: {
		type: String,
		required: true,
		unique: true
	},
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
		Ticket_userA: userA,
		Ticket_userB: userB,
		init_date: new Date(),
		Last_Turn: 0,
		turns: [], 
		status: 'not started'
	});
	newMatch.save(function(err){
		if(err)
			return handleError(err);
	});
	return newMatch._id;
};

matchSchema.methods.getTurns = function(id, turns){
	var query = this.model('Match').findById(id).only('turns', function (err){
		if(err)
			console.log('Could not get turns of match with id: s%', id);
			return handleError(err);
	});
	
	return query.exec(turns);
};

/*matchSchema.methods.matchStatus = function (result) {
	var query = this.model('Match')
		.find({_id: this.id});
   	query.only('status');
    return query.exec(result);
};



matchSchema.methods.findNewMatch = function (id, result){
	var query = this.model('Match').findOne({ userB: id, status: 'not started' });
	return query.exec(result);
};*/

mongoose.model('Match', matchSchema);