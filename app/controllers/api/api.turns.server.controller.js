'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('../errors'),
  async = require('async'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');



var sendNotSeenTurns = function(match, playerId, res){
  var i = match.players[playerId].lastSeenTurn;
  var turnsNotseen = [];
  while(++i < match.turns.length){
    turnsNotseen.push(match.turns[i]);
  };
  match.players[playerId].lastSeenTurn = i-1;
  match.markModified('players');
  match.save(function(err){
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for turns'
      });
    return res.status(201).send({
      message: 'It is your turn, submit turn',
      turns: turnsNotseen
    }); 
  }); 
};


var inactivePlayers = function(match, playerId, currentTurn, res){
  var i = currentTurn;
  while(!match.activePlayers[i]){  //Itera por todos los jugadores inactivos consecutivos que haya
    match.turns.push(null);
    i = (i+1)%2;
  };
  match.save(function(err){
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for turns'
      });
    sendNotSeenTurns(match, playerId, yourTurn, res);
  }); 
};



exports.wait = function(req, res) { //(matchId, playerId)
  var matchId = req.body.matchId;
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {   
      var thisPlayer = match.players[req.body.playerId];
      var currentTurn = match.turns.length % 2;
      if (thisPlayer.playerIndex !== currentTurn) { //If it's not player's turn
        inactivePlayers(match, req.body.playerId, currentTurn, res);
      }else{ 
        sendNotSeenTurns (match, req.body.playerId, res);
      }
    } else {
      return res.status(400).send({
        message: 'ERROR: There is no match with id = ' + matchId
      });
    }
  });
};



exports.submit = function(req, res) { //(matchId, Turn, playerId)
  var matchId = req.body.matchId;
  var turn = req.body.turn;
  var playerId = req.body.playerId; //playerId = ticketId
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) { 
      var currentTurn = match.turns.length % 2;
      if (match.players[playerId].playerIndex === currentTurn) {
        match.turns.push(turn);
        match.players[playerId].lastSeenTurn = match.turns.length-1;
        match.markModified('players');
        match.save(function(err) {
          if (err)
            return res.status(500).send({
              message: 'Error ocurred while submiting new turn'
            });
          res.status(201).send('Turn submited');
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