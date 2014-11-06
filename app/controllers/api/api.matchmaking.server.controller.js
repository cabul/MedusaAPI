'use strict';

var mongoose = require('mongoose'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');

var _eloratio = 0.3; // 0<_eloRatio<1, the bigger the ratio, more oponents will match

module.exports = function (ticket, res){
  if(hasElo(ticket)) eloPair(ticket, res);
  else{fifoPair(ticket, res);}
};


var fifoPair = function(ticket, res) {
  var query = Ticket.findOne({
      _id: {
        '$ne': ticket.id
      },
      matchId: null,
      elo: 0
  });
  query.exec(function (err, oponent) { //Cosas paranormales
    setMatch(err, oponent, ticket, res);
  });
};

var eloPair = function(ticket, res){
  var query = Ticket.findOne({
      _id: {
        '$ne': ticket.id
      },
      matchId: null,
      elo: {$gte : ticket.elo*(1-_eloratio), $lte: ticket.elo*(1+_eloratio)}
  });
  query.exec(function (err, oponent) { //Cosas paranormales
    setMatch(err, oponent, ticket, res);
  });
};

var setMatch = function (err, oponent, ticket, res) {
  if (err) return res.status(500).send({
    message: 'Could not processed request'
  });
  if (oponent) {
    var newMatch = new Match({
      players: [{
        name: oponent.name,
        elo: oponent.elo,
        ticket: oponent.id,
        submitTurn: true
      }, {
        name: ticket.name,
        elo: ticket.elo,
        ticket: ticket.id,
        submitTurn: false
      }],
      match_info: [{
        player1: oponent.id,
        player2: ticket.id
      }, {
        turn: oponent.id
      }], //-->Empieza el player1
      init_date: new Date(),
      turns: [],
      status: 'not established'
    });
    newMatch.save(function(err) {
      if (err) {
        console.log('Could not create new match');
        return res.status(500).send({
          message: 'Error ocurred while creating match'
        });
      }
      oponent.matchId = newMatch.id;
      oponent.save(function(err) {
        if (err) {
          return res.status(500).send({
            message: 'Error ocurred while updating match in oponent ticket  ' + err
          });
        }
        Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
          if (err) return res.status(500).send({
            message: 'Error ocurred while removing ticket'
          });
          return res.send({
            matchId: newMatch.id,
            players: newMatch.players,
            player: 1,
            nextTurn: 1
          }); //player: 1 = second player 
        });
      });
    });
  } else {
    return res.send('Could not find adversary. Please wait for an oponent...');
  }
};

var hasElo = function (ticket) {
  return (ticket.elo > 0);
};