'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket'),
	async = require('async');

exports.requestTicket = function(req, res){
	var params = { phoneId : req.param('phoneId')};
	return res.status(400).send(params);
};

exports.requestMatch = function(req, res, next){
	var params = { ticketId: req.body.ticketId };
	Ticket.findOne({}, function (err, oponent){
		console.log(oponent);
		if(err)
			return res.status(400).send({
							message: 'Could not processed requet for ticket with id : '+ params.ticketId
						});
		if (oponent) {
			var players = [params.ticketId, oponent._id];
			var newMatch = new Match({
				players: [{player1: players[0]}, {player2: players[1]}],
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
    	
        res.send(newMatch._id);
      	
    }else{
    	console.log('Could not find adversary');
      	res.send('Could not find adversary. Please wait for an oponent...');
	}
			
	});
};

exports.waitTurn = function(req, res){
	var params = {	matchId : req.param('matchId'),
					ticketId: req.param('ticketId'),
					turnId: req.param('turnId')
				};
	return res.status(400).send(params);

};

exports.submitTurn = function(req, res){
	var params = {	matchId: req.param('matchId'),
					ticketId: req.param('ticketId'),
					turnId: req.param('turnId'),
					turnInfo: req.param('turnInfo')
				 };
	return res.status(400).send(params);

};

exports.getMatchStatus = function(req, res){
	var matchId = req.body.matchId;
	Match.findById(matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while creating match'
			});

		res.send(match_status);
	});
};

exports.setMatchStatus = function(req, res){
	var matchId = req.body.matchId;
	Match.findById(matchId, function (err, match) {
    	if (err) 
    		return res.status(400).send({
							message: 'Error ocurred while finding match to update'
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