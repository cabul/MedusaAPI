'use strict';

var mongoose = require('mongoose'),
  errorHandler = require('./errors'),
  findMatch = require('./api/api.matchmaking'),
  Match = mongoose.model('Match'),
  Ticket = mongoose.model('Ticket');
//  async = require('async'); 

exports.ticket = function(req, res) {
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

exports.match = function(req, res) {
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



exports.players = function(req, res){
  Match.findOneById({matchId : req.body.matchId}, function (err, match){

  });
};

exports.retire = function(req, res){
  
};
/*
=======OBSOLETE========
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
};*/
