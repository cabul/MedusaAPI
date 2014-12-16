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
  },function(err,opponents){
    if(err) return cb(err);
    if(!opponents) return cb(null,null);
    var matchPlayers = opponents.slice(0,ticket.numberOfPlayers-1).concat(ticket);
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
  },function(err,opponents){
    if(err) return cb(err);
    if(!opponents) return cb(null,null);
    var matchPlayers = opponents.slice(0,ticket.numberOfPlayers-1).concat(ticket);
    Match.createFromTickets(matchPlayers).save(cb);
  });
};

exports.auto = function(ticket,cb){
  if(!!ticket.elo) eloMaker(ticket,cb);
  else fifoMaker(ticket,cb);
};

exports.fifo = fifoMaker;
exports.elo  = eloMaker;
