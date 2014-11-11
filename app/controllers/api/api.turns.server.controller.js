'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('../errors'),
  async = require('async'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');

var turnsNotSeen = function(match, thisPlayer, yourTurn, res){
  var i = thisPlayer.lastSeenTurn;
  var turns_not_seen = [];
  // console.log(yourTurn);
  var loop = function(i){
    if(i < match.turns.length){
      turns_not_seen.push(match.turns[i]);
      loop(parseInt(i)+1);
      
    } else {
    
      match.players[thisPlayer.playerIndex].lastSeenTurn = parseInt(match.turns.length)-1;
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
                    matchId: match.id,
                    message: 'Wait...',
                    turns: turns_not_seen
                  });    
        }
      }); 
    }
  };
  loop(i);
};


var inactivePlayers = function(match, thisPlayer, currentTurn, res){
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
    turnsNotSeen(match, thisPlayer, yourTurn, res);
  }); 
/*  var yourTurn = false;
  var loop = function(i){
    console.log(match.players);
    var yourTurn = !match.players[i].active; //array de jugadores inactivos para esto podria estar bien
    if(i < thisPlayer.playerIndex){
      if(yourTurn){
        match.turns.push(null);
        match.save(function(err){
        if (err)
            return res.status(500).send({
              message: 'Error ocurred while looking for turns'
            });
            loop(parseInt(i+1));
        }); 

      } else {
         loop(i+1);
      }
    } else if(i > thisPlayer.playerIndex){
       if(i < match.turns.length - 1){
         if(!yourTurn) turnsNotSeen(match, thisPlayer, yourTurn, res);
         loop(parseInt(i+1));
       } else{
          i = 0;
          loop(i);
       }
    } else {
       turnsNotSeen(match, thisPlayer, yourTurn, res);
    }
  };
  loop(i);*/
};


exports.wait = function(req, res) {
  var matchId = req.body.matchId; //(matchId, playerId)
  Match.findById(matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {   
      var thisPlayer = match.players[req.body.playerId];
      var currentTurn = match.turns.length % 2;
      if (thisPlayer.playerIndex !== currentTurn) { //If it's not player's turn
        inactivePlayers (match, thisPlayer, currentTurn, res);
      }else{
         turnsNotSeen(match, thisPlayer, true, res);
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
  var player = req.body.playerId; //player = ticketId
  Match.findById(matchId, function(err, match) {

    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + matchId
      });
    if (match) {
      var currentTurn = match.turns.length % 2;
      if (match.players[currentTurn].ticket === player) {
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