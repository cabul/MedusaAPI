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
	last_turn: {
		type: Number,
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


matchSchema.methods.getTurns = function(turns){
	var query = this.model('Match').findById(this.id, 'turns', function (err){
		if(err)
			console.log('Could not get turns of match with id: s%', this.id);
			return handleError(err);
	});
	
	return query.exec(turns);
};

matchSchema.methods.removeMatch = function (){
	this.model('Match').findByIdAndRemove(this.id, {}, function(err) {
    if (!err) {
           return ('Match with id = %s has been removed ', this.id);
    }
    else {
           console.log('Could not remove match with id = %s', this.id) ;
           return handleError(err);
    }
});
	
};

mongoose.model('Match', matchSchema);