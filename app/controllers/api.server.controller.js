'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket');
//	async = require('async');

exports.requestTicket = function(req, res){
	var params = { info : req.param('info')?req.param('info'):req.body.info};
	var newTicket = new Ticket(req.body); 
	newTicket.save(function(err){
				if(err){
					console.log('Could not create new ticket');
					return res.status(500).send({
							message: 'Error ocurred while creating ticket: \n' + err + '\n' + newTicket
						});
				}
				
	});	
	return res.send(newTicket._id);
};

exports.requestMatch = function(req, res, next){
	Ticket.findById(req.body.ticketId, function(err, ticket){
		if(err)
		return res.status(500).send({
							message: 'Error ocurred'
						});
		if(ticket){
			if(ticket.match){
				
				Match.findById(ticket.match, function(err,match){
					match.status = 'established';
					match.save(function(err){
					if(err)
						return res.status(500).send({
							message: 'Error ocurred while updating match status to established'
						});

					});
					Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
    					if(err)
							return res.status(500).send({
								message: 'Error ocurred while removing ticket'
							});
					});
					
					return res.send({matchId: match.id, players: match.players, player: 0, nextTurn:0}); //player: 0 = first player
				});
				
				
			}else{
				Ticket.findOne({}, function (err, oponent){
				console.log(oponent);
				if(err)
					return res.status(500).send({
							message: 'Could not processed requet'
						});
				if (oponent && ticket.id !== oponent.id) {
					var newMatch = new Match({
							players: 
								[{ name: oponent.name, elo: oponent.elo, ticket: oponent.id, submitTurn: true},
						 		{ name: ticket.name, elo: ticket.elo, ticket: ticket.id, submitTurn: false}],
							match_info: [{player1: oponent.id, player2: ticket.id},
										 {turn: oponent.id}],//-->Empieza el player1
							init_date: new Date(),
							turns: [], 
							status: 'not established'
							});
	    			newMatch.save(function(err){
					if(err){
						console.log('Could not create new match');
						return res.status(500).send({
										message: 'Error ocurred while creating match'
								});
					}
				
	  	    		});
	  	    		oponent.match = newMatch.id;
	  	    		oponent.save(function(err){
	  	    			return res.status(500).send({
										message: 'Error ocurred while updating match in oponent ticket'
								});
	  	    		});
    				Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
    					if(err)
							return res.status(500).send({
								message: 'Error ocurred while removing ticket'
							});
					});
        			return res.send({matchId: newMatch._id, players: newMatch.players, 
        								player: 1,  nextTurn:1}); //player: 1 = second player

			

    			}else{
    				console.log('Could not find adversary');
      				return res.send('Could not find adversary. Please wait for an oponent...');
				}
			
		    	});
			}
		}else{
			return res.status(400).send({
							message: 'Ticket '+ticket.id+ 'does not exist'
						});
		}
	});
	
	
};
			

exports.waitTurn = function(req, res, next){
	var params = req.body;
	var matchId = req.body.matchId;
	console.log(matchId);
	var nextTurn = params.nextTurn;
	var player = params.player;
	var players = params.players;
	Match.findById(matchId, function(err, match){
	
		if(err)
			return res.status(500).send({
										message: 'Error ocurred while looking for match with id = '+matchId
								});
		if(match){
			if(match.players[player].submitTurn === false){
				var last_turn = match.turns.length -1;
				if(last_turn === nextTurn){
					match.players[player].submitTurn = true;
			   		//submitTurn: true--> Le toca el turno
					match.save(function(err){
						if(err)
							return res.status(500).send({
										message: 'Error ocurred while updating match with id = '+match.id
								});
					});
					return res.send({matchId: matchId, players: players, player: player, nextTurn: nextTurn}); 
							
				}else{
					return res.send({matchId: matchId, players: players, player: player, nextTurn: nextTurn}); 
								//submitTurn: false--> Sigue en espera 
				}
			}else{
				return res.send('It is your turn, submit turn');
			}
				
		}else{
			return  res.status(400).send({
										message: 'ERROR: There is no match with id = '+matchId
								});
			
		}
	
	});
	
};

		


exports.submitTurn = function(req, res){
	var params = req.body;
	var matchId = params.matchId;
	var turn = params.turn;
	var player = params.player;
	var user = params.players[params.player].ticket;
	var nextTurn = params.nextTurn;
	Match.findById(matchId, function(err, match){
		
		if(err)
			return res.status(500).send({
										message: 'Error ocurred while looking for match with id = '+matchId
								});
		if(match){
				if(match.players[player].submitTurn === true){
					console.log(match.players[player].submitTurn);
					if(match.match_info[1].turn === user){
						//var last_turn = match.turns.length - 1;
						var oponent = 1 - player;
						match.turns[nextTurn] = turn;
						match.match_info[1].turn = match.players[oponent].ticket;
						match.players[params.player].submitTurn = false; 
						match.save(function(err){
							if(err)
							return res.status(500).send({
										message: 'Error ocurred while submiting saving new turn'
								});
						});
						// submitTurn: false:1 --> Ahora le tocará esperar por el próximo turno
						var newTurn = match.turns.length;
						res.send({match: match, matchId: matchId, players: params.players, player: player,  nextTurn: newTurn});
					}else{
						return res.status(400).send({
										message: 'It is not your turn'
								});
					}
		
				}else{
					return res.status(400).send({
										message: 'Error: It is not your turn'
								});
				}
		}else{
			return  res.status(400).send({
										message: 'ERROR: There is no match with id = '+matchId
								});
		}
			
	});
	
};

exports.getMatchStatus = function(req, res){
	var matchId = req.body.matchId;
	Match.findById(matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(500).send({
							message: 'Error ocurred while creating match'
			});

		res.send(match_status);
	});
};


exports.setMatchStatus = function(req, res){
	var matchId = req.body.matchId;
	Match.findById(matchId, function (err, match) {
    	if (err) 
    		return res.status(500).send({
							message: 'Error ocurred while looking for match to update'
			});

    	if(match){
    		match.status = req.body.status;

       		match.save(function (err) {
    			if (err) 
    			return res.status(500).send({
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
		show = '====TICKETS====\n'+JSON.stringify(tickets);
		Match.find({}, function(err, matches){
			if(err) return res.send(err);
			show += '\n====MATCHES====\n'+JSON.stringify(matches);
			res.send(show);
		});
	});
};

exports.dbpurge = function (req, res){
	Ticket.remove({}, function(err) { 
   		console.log('collection removed');
	});
	res.send('tickets removed');
};
