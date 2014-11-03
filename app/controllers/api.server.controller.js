'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket');
//	async = require('async');

exports.requestTicket = function(req, res){
	var newTicket = new Ticket({
			name: req.body.name,
			elo: req.body.elo,
			matchId: null
			}); 
	newTicket.save(function(err){
				if(err){
					console.log('Could not create new ticket');
					return res.status(500).send({
							message: 'Error ocurred while creating ticket'
						});
				}
		return res.status(201).send(newTicket._id);
	});	
};

exports.requestMatch = function(req, res, next){
	Ticket.findById(req.body.ticketId, function(err, ticket){
		if(err)
		return res.status(500).send({
							message: 'Error retrieving ticket'
						});
		if(ticket){
			if(ticket.matchId){
				
				Match.findById(ticket.matchId, function(err,match){
					if(!match)
						return res.status(500).send({
							message: 'Error retrieving match '+ticket.matchId
						});
					
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
				Ticket.findOne({_id : {'$ne': ticket.id}, matchId: null}, function (err, oponent){
					if(err)
						return res.status(500).send({
							message: 'Could not processed requet'
						});
					if (oponent) {
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
							
		  	    			oponent.matchId = newMatch.id;
		  	    			oponent.save(function(err){
		  	    				if(err){
			  	    				return res.status(500).send({
												message: 'Error ocurred while updating match in oponent ticket  '+err
										}); 
								}
	    			    		Ticket.findByIdAndRemove(ticket.id, {}, function(err) {
    							if(err)
									return res.status(500).send({
										message: 'Error ocurred while removing ticket'
									});
  	    						return res.send({matchId: newMatch.id, players: newMatch.players, 
   								player: 1,  nextTurn:1}); //player: 1 = second player 
								});

		  	    			});

						});


    				}else{
      					return res.send('Could not find adversary. Please wait for an oponent...');
					}
			
		    	});
			}
		}else{
			return res.status(400).send({
							message: 'Ticket '+req.body.ticketId+ 'does not exist'
			});
		}
	});
};
			

exports.waitTurn = function(req, res, next){
	var matchId = req.body.matchId;
	var nextTurn = req.body.nextTurn;
	var player = req.body.player;
	var players = req.body.players;
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
					//return res.send({matchId: matchId, players: players, player: player, nextTurn: nextTurn}); 
					return res.send('It is your turn, submit turn');	
				}else{
					return res.send('Waiting ...'); 
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
	var matchId = req.body.matchId;
	var turn = req.body.turn;
	var player = req.body.player;
	var user = req.body.players[player].ticket;
	var nextTurn = req.body.nextTurn;
	Match.findById(matchId, function(err, match){
		
		if(err)
			return res.status(500).send({
										message: 'Error ocurred while looking for match with id = '+matchId
								});
		if(match){
			if(match.players[player].submitTurn === true){
				
				//if(parseInt(match.match_info[1].turn) === parseInt(user)){ //->para hacer pruebas con tickets numéricos
				if(match.match_info[1].turn === user){
					var oponent = 1 - player;
					match.turns[nextTurn] = turn;
					match.match_info[1].turn = match.players[oponent].ticket;
					match.players[player].submitTurn = false; 
					match.save(function(err){
					if(err)
						return res.status(500).send({
							message: 'Error ocurred while submiting saving new turn'
						});
					});
					// submitTurn: false:1 --> Ahora le tocará esperar por el próximo turno
					var newTurn = match.turns.length;
					res.send({matchId: matchId, players: req.body.players, player: player,  nextTurn: newTurn});
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
	Match.findById(req.body.matchId, 'status' ,function(err, match_status){
		if(err)
			return res.status(500).send({
							message: 'Error ocurred while looking for match with id = '+req.body.matchId
			});

		res.status(201).send(match_status);
	});
};


exports.setMatchStatus = function(req, res){
	Match.findById(req.body.matchId, function (err, match) {
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

    			res.status(201).send(match);
    		});

    	}else{
    		res.status(400).send('ERROR: There is no Match with id = '+ req.body.matchId);
    	}
	    
    });
};
