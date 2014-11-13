'use strict';

var mongoose     = require('mongoose'),
    errorhandler = require('./utils/errorhandler'),
    Match        = mongoose.model('Match');

exports.wait = function(req, res) { //(matchId, playerId)
  var error = errorhandler(res);

  var matchId  = req.body.matchId,
      playerId = req.body.playerId;

  if(!matchId) return error('matchId expected',400);
  if(!playerId) return error('playerId expected',400);

  Match.findById(matchId, function(err, match) {
    if(err) return error(err);
    if(!match) return error('Match does not exist',400);
    if(!match.containsPlayer(playerId)) return error('Player does not exist',400);

    var unseenTurns = [];

    var last = match.players[playerId].lastSeenTurn;

    while( last++ < match.turns.length ) {
      unseenTurns.push(match.turns[last]);
    }
    match.sawTurns(playerId);

    match.save(function(err){
      if(err) return error(err);
      res.status(200).send({
        turns: unseenTurns,
        next: match.isTurnOf(playerId)
      });
    });
  });
};

exports.submit = function(req, res) {

  var error = errorhandler(res);

  var matchId  = req.body.matchId,
      playerId = req.body.playerId,
      turn     = req.body.turn;

  Match.findById(matchId, function(err, match) {
    if(err) return error(err);
    if(!match) return error('Match does not exist',400);
    if(!match.containsPlayer(playerId)) return error('Player does not exist',400);
    if(!match.isTurnOf(playerId)) return error('It is not your turn',400);
    if(!match.isActive(playerId)) return error('Player already retired',400);

    match.turns.push(turn);
    match.sawTurns(playerId);

    match.fastForward();

    match.save(function(err){
      if(err) return error(err);
      res.status(200).send('Turn OK');
    });
  });
};

exports.turns = function(req, res){  //(matchId)

  var error = errorhandler(res);

  var matchId = req.body.matchId;

  if(!matchId) return error('matchId expected',400);

  Match.findById(matchId, 'turns', function (err, turns){
    if(err) return error(err);
    res.status(200).send(turns);
  });
};
