'use strict';

var mongoose = require('mongoose'),
Ticket = mongoose.model('Ticket'),
Turn = mongoose.model('Turn'),
Match = mongoose.model('Match');

exports.requestTicket = function(req, res){
	var params = {
		"phoneId" : req.param('phoneId')
	};
	var newTicket = new Ticket({
		match_id: "hola",
		info: "info"
	});
	console.log(req.json_body);
	return res.send(JSON.stringify(req.body));
};

exports.requestMatch = function(req, res){
	var params = {
		"ticketId" : req.param('ticketId')
	};
	return res.status(400).send(params);
};

exports.waitTurn = function(req, res){
	var params = {
		"matchId" : req.param('matchId'),
		"ticketId": req.param('ticketId'),
		"turnId": req.param('turnId')
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
	return res.status(400).send(params);
};

exports.setMatchStatus = function(req, res){
	var params = {	
		"matchId" : req.param('matchId'),
		"ticketId": req.param('ticketId'),
		"statusInfo": req.param('statusInfo')
	};
	return res.status(400).send(params);
};