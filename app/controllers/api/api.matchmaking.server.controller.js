'use strict';

var mongoose = require('mongoose'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');

var _eloratio = 0.3;

var setMatch = function(err, oponent, ticket, res) { 
  if (err) return res.status(500).send({
    message: 'Could not processed request'
  });
  if (oponent) {
    var playersArray = {};
    playersArray[ticket.id] = {
      name: oponent.name,
      elo: oponent.elo,
      playerIndex: 0,
      lastSeenTurn: 0
    };
    playersArray[oponent.id] = {
      name: ticket.name,
      elo: ticket.elo,
      playerIndex: 1,
      lastSeenTurn: 0
    };
    var newMatch = new Match({
      players: playersArray,
      init_date: new Date(),
      turns: [],
      activePlayers: {0: true, 1: true}
    });
    newMatch.save(function(err) {
      if (err) {
        console.log('Could not create new match');
        return res.status(500).send({
          message: 'Error ocurred while creating match' + err
        });
      }
      oponent.matchId = newMatch.id;
      oponent.save(function(err) {
        if (err) {
          return res.status(500).send({
            message: 'Error ocurred while updating match in oponent ticket  ' + err
          });
        }
        var ticketId = ticket.id;
        Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
          if (err) return res.status(500).send({
            message: 'Error ocurred while removing ticket'
          });
          return res.send({
            matchId: newMatch.id,
            playerId: ticketId
          }); //player: 1 = second player 
        });
      });
    });
  } else {
    return res.send('Could not find adversary. Please wait for an oponent...');
  }
};

var fifoPair = function(ticket, res) {
  var query = Ticket.findOne({
    _id: {
      '$ne': ticket.id
    },
    matchId: null,
    elo: 0
  });
  query.exec(function(err, oponent) { //Cosas paranormales
    setMatch(err, oponent, ticket, res);
  });
};

var eloPair = function(ticket, res) {
  var query = Ticket.findOne({
    _id: {
      '$ne': ticket.id
    },
    matchId: null,
    elo: {
      $gte: ticket.elo * (1 - _eloratio),
      $lte: ticket.elo * (1 + _eloratio)
    }
  });
  query.exec(function(err, oponent) { //Cosas paranormales
    setMatch(err, oponent, ticket, res);
  });
};

var hasElo = function(ticket) {
  return (ticket.elo > 0);
};

module.exports = function(ticket, res) { //(ticket)
  if (hasElo(ticket)) eloPair(ticket, res);
  else {
    fifoPair(ticket, res);
  }
};