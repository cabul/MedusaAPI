'use strict';

var mongoose = require('mongoose'),
    errorhandler = require('./utils/errorhandler'),
    Ticket = mongoose.model('Ticket');

exports.ticket = function(req,res) {
  var error = errorhandler(res);

  var newTicket = new Ticket({
    name: req.body.name || 'Anonymous',
    elo: req.body.elo || 0,
    matchId: null
  });

  newTicket.save(function(err) {
    if (err) return error(err);
    return res.status(200).send(newTicket._id);
  });

};

exports.cancel = function(req,res) {
  var error = errorhandler(res);

  var playerId = req.body.playerId;

  if(!playerId) error('playerId expected',400);

  Ticket.findById(playerId,function(err,ticket){
    if(err) return error(err);
    if(ticket.hasMatch) return error('Player has a match',400);

    Ticket.findByIdAndRemove(playerId,function(err){
      if(err) return error(err);
      res.status(200).send('OK');
    });

  });

};