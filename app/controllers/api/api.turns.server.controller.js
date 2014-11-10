'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('../errors'),
  async = require('async'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');



var turnsNotSeen = function(match, thisPlayer, yourTurn, res){
  var i = match.players[thisPlayer].lastSeenTurn;
  var turns_not_seen = [];
  var loop = function(i){
    if(i < match.turns.length){
      turns_not_seen.push(match.turns[i]);
      loop(parseInt(i+1));
      
    } else {
    
      match.players[thisPlayer].lastSeenTurn = parseInt(match.turns.length-1);
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

var turnsBeforePlayer = function(match, turn_player, thisPlayer, res){
  var yourTurn = false;
  var turnBeforePlayer = false;
  for(var key in match.players){
    if(parseInt(match.players[key].playerIndex) === parseInt(match.players[thisPlayer].playerIndex)){
      turnsNotSeen(match, thisPlayer, yourTurn, res);
    
    }else{
      turnBeforePlayer = (parseInt(match.players[key].playerIndex) === parseInt(turn_player)) ? true : false; 
        if(turnBeforePlayer){
          yourTurn = (match.players[key].active) ? false : true;
        }
      }     
  }

};

var turnAfterPlayer = function(match, turn_player, thisPlayer, res){
    var yourTurn = false;
    var activeBeforePlayer = false;
    var foundThisPlayer = false;
    var i = match.turns.length ;
    var loop = function(i){
      for(var key in match.players){
        if(!foundThisPlayer){ //Primero busca los anteriores al player, si encuentra uno activo antes que él devuelve yourTurn=false
          activeBeforePlayer = (match.players[key].active) ? true : false;
            if(activeBeforePlayer) return turnsNotSeen(match, thisPlayer, false, res); //yourTurn = false
              foundThisPlayer = (parseInt(match.players[key].playerIndex) === parseInt(match.players[thisPlayer].playerIndex)) ? true : false;
              i -= parseInt(1);

        }else{ //Busca players inactivos después de él
          if(parseInt(i) < match.turns.length){
            yourTurn = (match.players[key].active) ? false : true;
            i -= parseInt(1);
          } else {
             return turnsNotSeen(match, thisPlayer, yourTurn, res);
          }
        }
      }
   };
   loop(i);
};


var inactivePlayers = function(match, thisPlayer, turn_player, res){
  var i = turn_player;

  if(turn_player < match.players[thisPlayer].playerIndex){
    turnsBeforePlayer(match, turn_player, thisPlayer, res); 

  }else{
     turnAfterPlayer(match, turn_player, thisPlayer, res);     
  }
};




exports.wait = function(req, res) {
  var matchId = req.body.matchId;
  var nextTurn = req.body.nextTurn;
  var player = req.body.player; //ticketId del usuario
  var thisPlayer;
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });

    if (match) {
         var turn_player = (match.turns.length % 2 === 0) ? 0 : 1;
         var players = match.players;
        
        
          if (parseInt(match.players[player].playerIndex) !== parseInt(turn_player)) { //If it's not player's turn
            inactivePlayers (match, player, turn_player, res);
          }else{
             turnsNotSeen(match, player, true, res); //I's player's turn
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
      if (match.players[player].playerIndex === turn_player) {
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