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


ticketSchema.methods.removeTicket = function (){
	this.model('Ticket').findByIdAndRemove(this.id, {}, function(err) {
    if (!err) {
           return ('Ticket removed %s', this.id);
    }
    else {
           console.log('Could not remove ticket by id %s', this.id) ;
           return handleError(err);
    }
});
	
};


 mongoose.model('Ticket', ticketSchema);