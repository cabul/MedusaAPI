'use strict';

var mongoose = require('mongoose'),
    Match    = mongoose.model('Match'),
    Ticket   = mongoose.model('Ticket');

var _eloratio = 0.3;

var fifoMaker = function(ticket,cb){
  Ticket.findOne({
    _id: {
      '$ne': ticket.id
    },
    matchId: null
  },function(err,opponent){
    if(err) return cb(err);
    if(!opponent) return cb(null,null);
    Match.createFromTickets([ticket,opponent]).save(cb);
  });
};

var eloMaker = function(ticket,cb){
  Ticket.findOne({
    _id: {
      '$ne': ticket.id
    },
    matchId: null,
    elo: {
      $gte: ticket.elo * (1 - _eloratio),
      $lte: ticket.elo * (1 + _eloratio)
    }
  },function(err,opponent){
    if(err) return cb(err);
    if(!opponent) return cb(null,null);
    Match.createFromTickets([ticket,opponent]).save(cb);
  });
};

exports.auto = function(ticket,cb){
  if(!!ticket.elo) eloMaker(ticket,cb);
  else fifoMaker(ticket,cb);
};

exports.fifo = fifoMaker;
exports.elo  = eloMaker;
