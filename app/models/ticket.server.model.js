'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
  name: String,
  elo: Number,
  matchId: String
});

 mongoose.model('Ticket', ticketSchema);