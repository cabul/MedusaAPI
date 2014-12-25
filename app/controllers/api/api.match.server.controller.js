'use strict';

var mongoose = require('mongoose'),
    errorhandler = require('./utils/errorhandler'),
    Match    = mongoose.model('Match'),
    Ticket   = mongoose.model('Ticket'),
    matchmaking = require('./utils/matchmaking').fifo;

exports.match = function(req,res) {
  var error = errorhandler(res);
  var playerId = req.body.playerId;
  console.log(req.body);
  if(!playerId) return error('playerId expected',400);
  Ticket.findById(playerId, function(err, ticket) {
    if(err) return error(err);
    if(!ticket) return error('Ticket does not exist',400);

    if(ticket.hasMatch()) {

      var matchId = ticket.matchId;

      Match.findById(matchId, function(err, match) {
        if(err) return error(err);
        if(!match) return error('matchId corrupted');
        Ticket.findByIdAndRemove(playerId,function(err){
          if(err) return error(err);
          res.status(200).send(match._id);
        });
      });

    } else {
      matchmaking(ticket,function(err,match){
        if(err) return error(err);
        if(!match) return error('Waiting for other players',404);
        // find all players and update match

        Ticket.update({
          _id: { '$in' : match.playerIds()}
        },{
          $set: { matchId: match._id }
        },{
          multi: true
        }, function(err,tickets){
          if(err) return error(err);
          Ticket.findByIdAndRemove(playerId,function(err){
            if(err) return error(err);
            res.status(200).send(match._id);
          });
        });
      });
    }
  });
};
