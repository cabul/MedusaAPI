'use strict';

var errorhandler = require('./utils/errorhandler'),
    mongoose     = require('mongoose'),
    Match        = mongoose.model('Match');

exports.players = function(req,res) {

  var error = errorhandler(res);

  var matchId  = req.body.matchId,
      playerId = req.body.playerId;

  if(!matchId) return error('matchId expected',400);
  if(!playerId) return error('playerId expected',400);

  Match.findById( matchId, function (err, match){
    if(err) return error(err);
    if(!match) return error('Match does not exist',400);
    if(!match.containsPlayer(playerId)) return error('Player does not exist',400);

    var players = [], pid,player;
    for( pid in match.players ) {
      if(!match.containsPlayer(pid)) continue;
      player = match.players[pid];
      players.push({
        name   : player.name,
        elo    : player.elo,
        enemy  : (pid !== playerId),
        active : match.activePlayers[pid],
        index  : player.playerIndex
      });
    }

    players.sort(function(a,b){ return a.index-b.index; });
    return res.status(200).send(players);
  });
};


exports.retire = function(req,res) {

  var error = errorhandler(res);

  var matchId  = req.body.matchId,
      playerId = req.body.playerId;

  Match.findById(matchId, function(err, match){
    if(err) return error(err);
    if(!match) return error('Match does not exist',400);
    if(!match.containsPlayer(playerId)) return error('Player does not exist',400);

    match.retire(playerId);
    match.fastForward();

    match.save(function(err){
      if(err) return error(err);
      return res.status(200).send('Player inactive now');
    });

  });

};
