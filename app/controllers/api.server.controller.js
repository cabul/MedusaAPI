'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors'),
  findMatch = require('./api/api.matchmaking'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');
//  async = require('async'); 

exports.requestTicket = function(req, res) {
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

exports.requestMatch = function(req, res) {
  Ticket.findById(req.body.ticketId, function(err, ticket) {
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
              player: req.body.ticketId
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

exports.waitTurn = function(req, res) {
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
      if (parseInt(match.players[turn_player].ticket) !== parseInt(player)) {
        var last_turn = match.turns.length;
       // if (parseInt(last_turn) === parseInt(nextTurn)) { //Aquí la diferencia entre doble y "triple =" sí importa
          //match.players[turn_player].submitTurn = true;
          //submitTurn: true--> Le toca el turno
         /* match.save(function(err) {
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
       /* } else {
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

exports.submitTurn = function(req, res) {
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


exports.players = function(req,res){
  Match.findById(req.body.matchId)
  .sort('player_index').exec(function (err, match){
    if(err)
       return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + req.body.matchId
      });
    if(match){
      var players_list='';
      var players = match.players;
      var who;
      players.forEach(function(player){
        who = (player.ticket === req.body.ticketId)?'Yourself':'Adversary';
        players_list += who+' '+ parseInt(player.player_index+1)+' --> name :'+player.name+' elo: '+player.elo+'\n';
      });
     return res.send(players_list);
     }else{
        return res.status(400).send('Error retrieving match '+ req.body.matchId);
     }
  });
};

exports.getMatchStatus = function(req, res) {
  Match.findById(req.body.matchId, 'status', function(err, match_status) {
    if (!match_status)
      return res.status(400).send({
        message: 'There is no match ' + req.body.matchId
      });
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match with id = ' + req.body.matchId
      });

    res.status(201).send(match_status);
  });
};

exports.setMatchStatus = function(req, res) {
  Match.findById(req.body.matchId, function(err, match) {
    if (err)
      return res.status(500).send({
        message: 'Error ocurred while looking for match to update'
      });

    if (match) {
      match.status = req.body.status;

      match.save(function(err) {
        if (err)
          return res.status(500).send({
            message: 'Error ocurred while updating match status'
          });

        res.status(201).send(match);
      });

    } else {
      res.status(400).send('ERROR: There is no Match with id = ' + req.body.matchId);
    }
  });
};