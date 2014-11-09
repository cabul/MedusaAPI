'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('../errors'),
  async = require('async'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');

var turnsNotSeen = function(match, thisPlayer, yourTurn, res){
  var i = thisPlayer.lastSeenTurn;
  var turns_not_seen = [];
  var loop = function(i){
    if(i < match.turns.length){
      turns_not_seen.push(match.turns[i]);
      loop(parseInt(i+1));
      
    } else {
    
      match.players[thisPlayer.playerIndex].lastSeenTurn = parseInt(match.turns.length-1);
      match.markModified('players');
      match.save(function(err){
        if (err)
            return res.status(500).send({
              message: 'Error ocurred while looking for turns'
            });
        if(yourTurn){
          return res.status(201).send({
                    message: 'It is your turn, submit turn',
                    turns: turns_not_seen
                  });      
        }else{
          return res.status(201).send({
                    message: 'Wait...',
                    turns: turns_not_seen
                  });    
        }
      }); 
    }
  };
  loop(i);
};


var inactivePlayers = function(match, thisPlayer, turn_player, res){
  var i = turn_player;
  var yourTurn = false;
  var loop = function(i){
    if(i < thisPlayer.playerIndex){
      yourTurn = (match.players[i].active) ? false : true;
      if(yourTurn === false){
        match.turns.push(null);
        match.save(function(err){
        if (err)
            return res.status(500).send({
              message: 'Error ocurred while looking for turns'
            });
            loop(i+1);
        }); 

      } else {
         loop(i+1);
      }

    }else{
       turnsNotSeen(match, thisPlayer, yourTurn, res);
    }
  };
  loop(i);
};


exports.wait = function(req, res) {
  var matchId = req.body.matchId;
  var nextTurn = req.body.nextTurn;
  var playerId = req.body.player; //ticketId del usuario
  var thisPlayer;
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });

    if (match) {
         var turn_player = (match.turns.length % 2 === 0) ? 0 : 1;
         var players = match.players;
        
          match.players.forEach(function(player){
            if(player.ticket === playerId){
              thisPlayer = player;
            }
          });
          if (match.players[turn_player].ticket !== playerId) { //If is not player's turn
            turnsNotSeen(match, thisPlayer, true, res);
          }else{
             inactivePlayers (match, thisPlayer, turn_player, res);
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
  Match.findById(matchId, function(err, match) {

    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {
      var turn_player = (match.turns.length % 2 === 0) ? 0 : 1;
      if (match.players[turn_player].ticket === player) {
        match.turns.push(turn);
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