'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket'),
	async = require('async');

exports.requestTicket = function(req, res){
	var newTicket = new Ticket(req.body); 
	newTicket.save(function(err){
				if(err){
					console.log('Could not create new ticket');
					return res.status(400).send({
							message: "Error ocurred while creating ticket"
					});
				}
				return res.send(newTicket);
	});	
};
function removeTicket (ticketId){
	Ticket.findByIdAndRemove(ticketId, {}, function(err) {
    	if (!err) {
           	return ('Ticket removed %s', ticketId);
    	}
    	else {
          	console.log('Could not remove ticket by id %s', ticketId) ;
           	return errorHandler(err);
    	}
	});
}
exports.requestMatch = function(req, res, next){
	var ticketId = req.body.ticketId;
	Match.findOne({ 'players[0].ticket': ticketId ,status: 'not established'}, 'players', function(err, match){
		if(err)
			return res.status(400).send({
							message: 'Error ocurred while looking for a match '
						});
		if(match){
			removeTicket(ticketId);
			match.status = 'established';
			match.save(function(err){
				if(err)
					return res.status(400).send({
							message: 'Error ocurred while updating match status to established'
						});
			});
			return res.send({matchId: match._id, players: match.players, player: 0}); //player: 0 = first player
		}else{
			Ticket.findOne({}, function (err, oponent){
			console.log(oponent);
			if(err)
				return res.status(400).send({
							message: 'Could not processed requet for ticket with id : '+ req.body._id
						});
			if (oponent) {
				var players = [oponent._id, ticketId];
				Ticket.findById(ticketId, function(err, userTicket){
				var newMatch = new Match({
								players: [{player1: { name: userTicket.info[0], ticket: players[0]}},
						 		   		{player2: { name: oponent.name, ticket: players[1]}}],
								match_info: [{player1: players[0]}, {player2: players[1]}],
								init_date: new Date(),
								Last_Turn: 0,
								turns: [], 
								status: 'not established'
	   							});
	    
	    		newMatch.save(function(err){
				if(err){
					console.log('Could not create new match');
					return res.status(400).send({
										message: 'Error ocurred while creating match'
								});
				}
				
	  	    	});
    			removeTicket(ticketId);
        		return res.send({matchId: newMatch._id, players: newMatch.players, player: 1}); //player: 1 = second player
				}); 
								
      	
    		}else{
    			console.log('Could not find adversary');
      			return res.send('Could not find adversary. Please wait for an oponent...');
			}
			
		    });
		}
			
	});
	
};


exports.waitTurn = function(req, res, next){
	var matchId = req.body.matchId;
	var nextTurn = req.body.nextTurn;
	if(req.body.player === 1){
	Match.findById(matchId, function(err, match){
		if(err)
			return res.status(400).send({
										message: 'Error ocurred while creating match'
								});
		if(match){
			//var turns = match.getTurns(matchId);
			if(match.last_turn === nextTurn){
				return res.send({matchId: matchId, players: req.body.players, player: 0, nextTurn: nextTurn}); 
				//player:0--> Le toca el turno
			}else{
				return res.send({matchId: matchId, players: req.body.players, player: 1, nextTurn: nextTurn}); 
				//player:1--> Sigue en espera 
			}
			
		}else{
			return res.send('ERROR: There is no match with id = '+matchId);
		}
	});
	}else{
		return res.send('It is your turn, submit turn');
	}
	/*var params = {	matchId : req.param('matchId'),
					ticketId: req.param('ticketId'),
					turnId: req.param('turnId')
				};

	return res.status(400).send(params);*/
};

exports.submitTurn = function(req, res){
	var params = req.body;
	var matchId = params.matchId;
	var turn = params.turn;
	if(params.player === 0){
	Match.findById(matchId, function(err, match){
		if(err)
			return res.status(400).send({
										message: 'Error ocurred while creating match'
								});
		if(match){
			match.turns[match.last_turn] = turn;
			match.last_turn = match.last_turn +1;
			match.save(function(err){
				if(err)
					return res.status(400).send({
										message: 'Error ocurred while submiting saving new turn'
								});
			});
			// player:1 --> Ahora le tocará esperar por el próximo turno
			res.send({matchId: matchId, players: params.players, player: 1, nextTurn: match.last_turn + 1});
		}else{
			return res.send('Error: There is no match with id = '+matchId);
		}
	});
	}else{
		return res.send('Error: It is not your turn');
	}
	/*var params = {	
		matchId: req.param('matchId'),
		ticketId: req.param('ticketId'),
		turnId: req.param('turnId'),
		turnInfo: req.param('turnInfo')
	};
	return res.status(400).send(params);*/
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
	var show;
	Ticket.find({}, function (err, tickets){
		if(err) return res.send(err);
		show = "====TICKETS====\n"+JSON.stringify(tickets);
		Match.find({}, function(err, matches){
			if(err) return res.send(err);
			show += "\n====MATCHES====\n"+JSON.stringify(matches);
			res.send(show);
		});
	});
};

exports.dbpurge = function (req, res){
	Ticket.remove({}, function(err) { 
   		console.log('collection removed') 
	});
	res.send("tickets removed");
}