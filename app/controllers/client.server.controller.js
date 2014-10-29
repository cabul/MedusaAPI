'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket'),
	async = require('async');

exports.requestTicket = function(req, res){
	var params = { phoneId : req.param('phoneId')};
	return res.send(params);
};

exports.requestMatch = function(req, res, next){
	Match.findOne({ 'players[0].ticket': req.body.ticketId ,status: 'not started'}, 'players', function(err, match){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while looking for match '
						});
		if(match){
			req.body.ticket.removeTicket(req.body.ticketId);
			return res.send({matchId: match._id, players: match.players});
		}else{
			Ticket.findOne({}, function (err, oponent){
			console.log(oponent);
			if(err)
				return res.status(400).send({
							message: 'Could not processed requet for ticket with id : '+ req.body.ticketId
						});
			if (oponent) {
				var players = [req.body.ticketId, oponent._id];
				var newMatch = new Match({
									players: [{player1: { name: req.body.name, ticket: players[0]}},
						 		   			{player2: { name: oponent.name, ticket: players[1]}}],
								   	match_info: [{player1: players[0]}, {player2: players[1]}],
									init_date: new Date(),
									Last_Turn: 0,
									turns: [], 
									status: 'not started'
	   							});
	    
	    		newMatch.save(function(err){
				if(err){
					console.log('Could not create new match');
					return res.status(400).send({
							message: 'Error ocurred while creating match'
						});
				}
				
	  	    	});
    			req.body.ticket.removeTicket(req.body.ticketId);
        		return res.send({matchId: newMatch._id, players: newMatch.players});
      	
    		}else{
    			console.log('Could not find adversary');
      			res.send('Could not find adversary. Please wait for an oponent...');
			}
			
		    });
		}
			
	});
	
};

exports.waitTurn = function(req, res, next){
	var params = {	matchId : req.param('matchId'),
					ticketId: req.param('ticketId'),
					turnId: req.param('turnId')
				};

	return res.status(400).send(params);
};

exports.submitTurn = function(req, res){
	var params = {	
		"matchId": req.param('matchId'),
		"ticketId": req.param('ticketId'),
		"turnId": req.param('turnId'),
		"turnInfo": req.param('turnInfo')
	};
	return res.status(400).send(params);
};

exports.getMatchStatus = function(req, res){
	var params = {	
		"matchId" : req.param('matchId'),
		"ticketId": req.param('ticketId')
	};
	var matchId = req.body.matchId;
	Match.findById(matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while creating match'
			});

		res.send(match_status);
	});
	return res.status(400).send(params);
};


exports.setMatchStatus = function(req, res){
	var matchId = req.body.matchId;
	Match.findById(matchId, function (err, match) {
    	if (err) 
    		return res.status(400).send({
							message: 'Error ocurred while looking for match to update'
			});

    	if(match){
    		match.status = req.body.status;

       		match.save(function (err) {
    			if (err) 
    			return res.status(400).send({
							message: 'Error ocurred while updating match status'
				});

    			res.send(match);
    		});

    	}else{
    		res.send('ERROR: There is no Match with id = '+ matchId);
    	}
	    
    });
};

exports.db = function (req, res){
	Ticket.find({}, function (err, tickets){
		if(err) 
			return res.send(err);
		res.json(tickets);
	});
}
