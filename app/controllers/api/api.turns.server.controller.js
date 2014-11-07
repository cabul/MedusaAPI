'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('../errors'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');

exports.wait = function(req, res) {
  var matchId = req.body.matchId;
  var nextTurn = req.body.nextTurn;
  var player = req.body.player; //ticketId del usuario
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {
      var turn_player = (match.turns.length % 2 === 0) ? 0 : 1;
      var last_turn = match.turns.length;
      if (match.players[turn_player].ticket !== player) {
       
       /* if (last_turn == nextTurn) { //Aquí la diferencia entre doble y "triple =" sí importa
          match.players[turn_player].submitTurn = true;
          //submitTurn: true--> Le toca el turno
          match.save(function(err) {
            if (err)
              return res.status(500).send({
                message: 'Error ocurred while updating match with id = ' + match.id
              });
            return res.send({
              message: 'It is your turn, submit turn',
              last_turn: match.turns[match.turns.length-1]
            });
          });*/
          return res.send({
              message: 'It is your turn, submit turn',
              last_turn: match.turns[match.turns.length-1]
            });
        /*} else {
          //submitTurn: false--> Sigue en espera 
          return res.send('Waiting ...' + 'nextTurn: ' + nextTurn + '; lasTurn: ' + last_turn);
        }*/
      } else {
        return res.send({
          message: 'It is your turn, submit turn',
          last_turn: match.turns[match.turns.length-1]
        });      
      }

    } else {
      return res.status(400).send({
        message: 'ERROR: There is no match with id = ' + matchId
      });

    }

  });

};

exports.submit = function(req, res) {
  var matchId = req.body.matchId;
  var turn = req.body.turn;
  var player = req.body.player; //player = ticketId
  var nextTurn = req.body.nextTurn;
  Match.findById(matchId, function(err, match) {

    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {
      var turn_player = (match.turns.length % 2 === 0) ? 0 : 1;
      if (match.players[turn_player].ticket === player) {
        match.turns.push(turn);
        // submitTurn: false--> Ahora le tocará esperar por el próximo turno
        match.players[turn_player].submitTurn = false;
        match.save(function(err) {
          if (err)
            return res.status(500).send({
              message: 'Error ocurred while submiting saving new turn'
            });
          var newTurn = match.turns.length + 1;
          res.send({
            matchId: matchId,
            player: player,
            nextTurn: newTurn
          });
        });

      } else {
        return res.status(400).send({
          message: 'Error: It is not your turn'
        });
      }

    } else {
      return res.status(400).send({
        message: 'ERROR: There is no match with id = ' + matchId
      });
    }

  });

};