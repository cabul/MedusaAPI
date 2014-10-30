'use strict';

/**
 * Module dependencies.
 */
var handleError = require ('../controllers/errors');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
	info: {
      type: Array,
      required: false,
      unique: false
  }
});


ticketSchema.methods.removeTicket = function (ticketId){
	this.model('Ticket').findByIdAndRemove(ticketId, {}, function(err) {
    if (!err) {
           return ('Ticket removed %s', ticketId);
    }
    else {
           console.log('Could not remove ticket by id %s', ticketId) ;
           return handleError(err);
    }
});
	
};


 mongoose.model('Ticket', ticketSchema);