'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
	match_id: {
		type: String,
		require: false,
		unique: true
	},
	info: {
		type: String,
		required: false,
		unique: false
	}
});

ticketSchema.methods.createTicket = function (ticket){
	var newTicket = new this.model('Ticket') ({
		match_id: null,
		info: 'Ticket created' 
	});
	newTicket.save(function(err){
		if(err)
			return handleError(err);
	});
	return newTicket._id;
};


ticketSchema.methods.isTicketFromMatch = function (ticket, match) {
	this.model('Ticket')
		.findById( { _id: ticket }, 'matchid')
		.exec(function (err, matchid){
		 if(err)
			return handleError(err);
		 return (match === matchid)?true:false;
	});

};

 mongoose.model('Ticket', ticketSchema);