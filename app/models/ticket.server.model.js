'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
	info: {
		type: String,
		required: false,
		unique: false
	},
	match_id: {
		type: String,
		require: false,
		unique: true
	}
});

ticketSchema.methods.createTicket = function (ticket){
	var newTicket = new this.model('Ticket') ({
		info: 'Ticket created' ,
		match_id: null
	});
	newTicket.save(function(err){
		if(err)
			return handleError(err);
	    //res.send({ msg: 'Match created' });
	});
	return newTicket._id;
};

ticketSchema.methods.isTicketFromMatch = function (ticket, match) {
	this.model('Ticket').find( { _id: ticket , match_id: match }, function (err, result){
		if(err)
			return handleError(err);
		return (result)?true:false;
	});
	
};


 mongoose.model('Ticket', ticketSchema);