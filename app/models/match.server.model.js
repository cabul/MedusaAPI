'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

var matchSchema = new Schema({
	players: {},
	init_date: Date,
	turns: Array
});


/*matchSchema.static.getTurns = function (matchId, turns){
	this.model('Match').findById(matchId, 'turns', function (err, turns){
		if(err){
			console.log('Could not get turns of match with id: s%', matchId);
			return err;
		}
		return turns;
	});
};*/

/*matchSchema.static.removeMatch = function (matchId){
	this.model('Match').findByIdAndRemove(matchId, {}, function(err) {
    if (!err) {
           return ('Match with id = %s has been removed ', matchId);
    }
    else {
           console.log('Could not remove match with id = %s', matchId) ;
           return err;
    }
});
	
};*/

mongoose.model('Match', matchSchema);