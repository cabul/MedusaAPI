'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ticketSchema = new Schema({
  name: String,
  elo: Number,
  numberOfPlayers: Number,
  matchId: String,
  setup: Object
});

ticketSchema.methods.hasMatch = function() {
  return !!(this.matchId);
};

ticketSchema.methods.numOpponents = function(){
  return this.numberOfPlayers - 1;
};

mongoose.model('Ticket', ticketSchema);
