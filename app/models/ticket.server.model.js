'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
  name: String,
  elo: Number,
  numberOfPlayers: Number,
  matchId: String
});

ticketSchema.methods.hasMatch = function() {
  return !!(this.matchId);
};

mongoose.model('Ticket', ticketSchema);
