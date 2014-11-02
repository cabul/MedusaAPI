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
					Ticket.removeTicket(ticket.id, function(err){
					if(err){
						return res.status(500).send({
							message: 'Error ocurred while removing ticket'
						});
					}
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
					var players = [oponent.id, ticket.id];
					var newMatch = new Match({
							players: 
								[{player1: { name: oponent.name, elo: oponent.elo, ticket: players[0], submitTurn: true}},
						 		{player2: { name: ticket.name, elo: ticket.elo, ticket: players[1], submitTurn: false}}],
							match_info: {player1: players[0], player2: players[1], turn: players[0]},//-->Empieza el player1
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
    				Ticket.removeTicket(ticket.id, function(err){
					if(err){
						return res.status(500).send({
							message: 'Error ocurred while removing ticket'
						});
					}
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
	var params = JSON.parse(req.body);
	//var params = req.body;
	var matchId = req.body.matchId;
	var nextTurn = params.nextTurn;
	var player = params.player;
	var players = params.players;
	Match.findById(matchId, function(err, match){
	
		if(err)
			return res.status(500).send({
										message: 'Error ocurred while looking for match with id = '+matchId
								});
		if(match){
			if(!match.players[player].submitTurn){
				var last_turn = match.turns.length -1;
				if(last_turn === nextTurn){
					match.players[player].submitTurn = true;
			   		//submitTurn: true--> Le toca el turno
					match.save(function(err){
						if(err)
							return res.status(500).send({
										message: 'Error ocurred while updating match with id = '+matchId
								});
					});
					return res.send({matchId: matchId, players: players, player: player, nextTurn: nextTurn + 1 }); 
							
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
	var params = JSON.parse(req.body);
	var matchId = params.matchId;
	var turn = params.turn;
	var player = params.player;
	var user = params.players[params.player].ticket;
	
	Match.findById(matchId, function(err, match){
		
		if(err)
			return res.status(500).send({
										message: 'Error ocurred while looking for match with id = '+matchId
								});
		if(match){
				if(match.players[player].submitTurn){
		
					if(match.match_info.turn === user){
						var last_turn = match.turns.length - 1;
						var oponent = 1 - player;
						match.turns[last_turn + 1] = turn;
						match.match_info.turn = match.players[oponent].ticket;
						match.players[params.player].submitTurn = false; 
						match.save(function(err){
							if(err)
							return res.status(500).send({
										message: 'Error ocurred while submiting saving new turn'
								});
						});
						// submitTurn: false:1 --> Ahora le tocará esperar por el próximo turno
			
						res.send({matchId: matchId, players: params.players, player: 1,  nextTurn: last_turn + 1});
					}else{
					return res.status(500).send({
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
	var match = new Match(req.body);
	var matchId = match._id;
	Match.findById(matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(500).send({
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
	Ticket.find({}, function (err, tickets){
		if(err) 
			return res.send(err);
		res.json(tickets);
	});
};
