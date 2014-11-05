'use strict';

var mongoose = require('mongoose'), 
  errorHandler = require('./errors'),
  findMatch = require('./api/api.matchmaking'),
  Match = mongoose.model('Match'), 
  Ticket = mongoose.model('Ticket');
//  async = require('async'); 

exports.requestTicket = function(req, res) {
  var newTicket = new Ticket({
    name: req.body.name,
    elo: req.body.elo?req.body.elo:0,
    matchId: null
  });
  newTicket.save(function(err) {
    if (err) {
      console.log('Could not create new ticket');
      return res.status(500).send({
        message: 'Error ocurred while creating ticket'
      });
    }
    return res.status(201).send(newTicket._id);
  });
};

exports.requestMatch = function(req, res){

	Ticket.findById(req.body.ticketId, function(err, ticket){
		if(err)
		return res.status(500).send({
							message: 'Error retrieving ticket'
						});
		if(ticket){
			if(ticket.matchId){ //This ticket has an associated match
				
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
				
				
			}else{ //This ticket has no associated match yet 
        findMatch(ticket, res);
			}
		}else{
			return res.status(400).send({
							message: 'Ticket '+req.body.ticketId+ 'does not exist'
			});
		}
	});
};
			

exports.waitTurn = function(req, res){
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
				var last_turn = match.turns.length;
				if(last_turn === nextTurn){ 
					match.players[player].submitTurn = true;
			   		//submitTurn: true--> Le toca el turno
					match.save(function(err){
						if(err)
							return res.status(500).send({
										message: 'Error ocurred while updating match with id = '+match.id
								});
					});
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
					var newTurn = match.turns.length + 1;
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
	    