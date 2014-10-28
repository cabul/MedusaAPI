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
	}
});

ticketSchema.methods.createTicket = function (ticket){
	var newTicket = new this.model('Ticket') ({
		info: 'Ticket created' 
	});
	newTicket.save(function(err){
		if(err)
			console.log('Could not save new ticket');
			return handleError(err);
	});
	console.log('New ticket created');
	return newTicket._id;
};


ticketSchema.methods.removeTicket = function (ticketid){
	this.model('Ticket').findByIdAndRemove({ _id: ticketid }, function(err) {
    if (!err) {
           return ('Ticket removed %s', ticketid);
    }
    else {
           console.log('Could not remove ticket by id %s', ticketid) ;
           return handleError(err);
    }
});
	
};


 mongoose.model('Ticket', ticketSchema);