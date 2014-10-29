'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket'),
	async = require('async');

exports.requestTicket = function(req, res){
	var params = { info : req.param('info')?req.param('info'):req.body.info};
	var newTicket = new Ticket(req.body); 
	newTicket.save(function(err){
				if(err){
					console.log('Could not create new ticket');
					return res.status(400).send({
							message: "Error ocurred while creating ticket: \n" + err + "\n" + newTicket
						});
				}
				return res.send(newTicket);
	  	    });	
};

exports.requestMatch = function(req, res, next){
	var ticket = new Ticket(req.body);
	//req.body._id = ticketId
	Match.findOne({ 'players[0].ticket': req.body._id ,status: 'not started'}, 'players', function(err, match){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while looking for a match '
						});
		if(match){
			req.body.ticket.removeTicket(req.body._id);
			return res.send({matchId: match._id, players: match.players, player: 0}); //player: 0 = first player
		}else{
			Ticket.findOne({}, function (err, oponent){
			console.log(oponent);
			if(err)
				return res.status(400).send({
							message: 'Could not processed requet for ticket with id : '+ req.body._id
						});
			if (oponent) {
				var players = [oponent._id, req.body._id];
				var newMatch = new Match({
									players: [{player1: { name: req.body.info[0], ticket: players[0]}},
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
    			req.body.ticket.removeTicket(req.body._id);
        		return res.send({matchId: newMatch._id, players: newMatch.players, player: 1}); //player: 1 = second player
      	
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
		matchId: req.param('matchId'),
		ticketId: req.param('ticketId'),
		turnId: req.param('turnId'),
		turnInfo: req.param('turnInfo')
	};
	return res.status(400).send(params);
};

exports.getMatchStatus = function(req, res){
	var match = new Match(req.body);
	var matchId = match._id;
	Match.findById(matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while creating match'
			});

		res.send(match_status);
	});
};


exports.setMatchStatus = function(req, res){
	var match = new Match(req.body);
	var matchId = match._id;
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
};
