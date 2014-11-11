'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors'),
  findMatch = require('./api/api.matchmaking'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');
//  async = require('async'); 

exports.ticket = function(req, res) { //(name, elo)
  var newTicket = new Ticket({
    name: req.body.name,
    elo: req.body.elo ? req.body.elo : 0,
    matchId: null
  });
  newTicket.save(function(err) {
    if (err) {
      console.log('Could not create new ticket');
      return res.status(500).send({
        message: 'Error ocurred while creating ticket'
      });
    }
    return res.status(201).send(newTicket._id);
  }); 
};

exports.match = function(req, res) { //(playerId)
  Ticket.findById(req.body.playerId, function(err, ticket) {
    if (err)
      return res.status(500).send({
        message: 'Error retrieving ticket'
      });
    if (ticket) {
      if (ticket.matchId) { //This ticket has an associated match
        Match.findById(ticket.matchId, function(err, match) {
          if (!match)
            return res.status(500).send({
              message: 'Error retrieving match ' + ticket.matchId
            });
          Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
            if (err)
              return res.status(500).send({
                message: 'Error ocurred while removing ticket'
              });
            return res.send({
              matchId: match.id,
              playerId: req.body.playerId
            }); //player: 0 = first player
          });
        });
      } else { //This ticket has no associated match yet 
        findMatch(ticket, res);
      }
    } else {
      return res.status(400).send({
        message: 'Ticket ' + req.body.ticketId + 'does not exist'
      });
    }
  });
};




exports.players = function(req,res){ //(matchId, playerId?)
  Match.findById(req.body.matchId)
  .sort('playerIndex').exec(function (err, match){
    if(err)
       return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + req.body.matchId
      });
    if(match){
      var players_list='';
      var players = match.players;
      var who;
      Object.keys(match.players).forEach(function(playerId){   //for playerId of match.players
        var player = match.players[playerId];
        who = (playerId === req.body.playerId)?'Yourself':'Adversary';
        players_list += who+' '+ parseInt(player.playerIndex+1)+' --> name :'+player.name+' elo: '+player.elo+'\n';
      });
     return res.status(201).send(players_list);
     }else{
        return res.status(400).send('Error retrieving match '+ req.body.matchId);
     }
  });
};


exports.retire = function(req, res){ //(matchId, playerId)
  Match.findById(req.body.matchId, function(err, match){
    if(err)
       return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + req.body.matchId
      });
    if(match.players){
      var playerIndex = match.players[req.body.playerId].playerIndex;
      match.activePlayers[playerIndex] = false;
      match.markModified('activePlayers');
      match.save(function (err){
        if (err) 
          return res.status(500).send({
            message: 'Could not set player as inactive'
          });  
        return res.status(201).send({
          message : 'you are inactive now'
        });
      }); 
    }else{ 
       return res.status(500).send({
        message: 'There are no players for match with id = ' + req.body.matchId
      });
    }
  });
};

exports.turns = function(req, res){  //(matchId)

  Match.findById(req.body.matchId, 'turns', function (err, turns){
    if(err){
      return res.status(500).send({
        message: 'Error retrieving match ' + req.body.matchId
      });
    }
    return res.status(201).send(turns);
  });
};
