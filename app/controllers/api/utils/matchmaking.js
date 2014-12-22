'use strict';

var mongoose = require('mongoose'),
    Match    = mongoose.model('Match'),
    Ticket   = mongoose.model('Ticket');

var _eloratio = 0.3;

var fifoMaker = function(ticket,cb){
  Ticket.find({
    _id: {
      '$ne': ticket.id
    },
    numberOfPlayers: ticket.numberOfPlayers,
    matchId: null
  })
  .limit(ticket.numOpponents())
  .exec(function(err,opponents){
    if(err) return cb(err);
    if(opponents.length < ticket.numOpponents()) return cb(null,null);
    var matchPlayers = opponents.concat(ticket);
    Match.createFromTickets(matchPlayers).save(cb);
  });
};

var eloMaker = function(ticket,cb){
  Ticket.find({
    _id: {
      '$ne': ticket.id
    },
    matchId: null,
    numberOfPlayers: ticket.numberOfPlayers,
    elo: {
      $gte: ticket.elo * (1 - _eloratio),
      $lte: ticket.elo * (1 + _eloratio)
    }
  })
  .limit(ticket.numOpponents())
  .exec(function(err,opponents){
    if(err) return cb(err);
    if(opponents.length < ticket.numOpponents()) return cb(null,null);
    var matchPlayers = opponents.concat(ticket);
    Match.createFromTickets(matchPlayers).save(cb);
  });
};

exports.auto = function(ticket,cb){
  if(!!ticket.elo) eloMaker(ticket,cb);
  else fifoMaker(ticket,cb);
};

exports.fifo = fifoMaker;
exports.elo  = eloMaker;
