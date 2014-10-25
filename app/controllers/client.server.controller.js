'use strict';

var mongoose = require('mongoose');

exports.requestTicket = function(req, res){
	var phoneId = req.params.phoneId;
	return res.status(400).send(req.params);
};
exports.requestMatch = function(req, res){
	var ticketId = req.params.ticketId;
	return res.status(400).send(req.params);
};
exports.waitTurn = function(req, res){
	var matchId = req.params.matchId;
	var ticketId = req.params.ticketId;
	var turnId = req.params.turnId;
	return res.status(400).send(req.params);

};
exports.submitTurn = function(req, res){
	var matchId = req.params.matchId;
	var ticketId = req.params.ticketId;
	var turnId = req.params.turnId;
	var turnInfo = req.params.turnInfo;
	return res.status(400).send(req.params);

};
exports.getMatchStatus = function(req, res){
	var matchId = req.params.matchId;
	var ticketId = req.params.ticketId;
	return res.status(400).send(req.params);


};
exports.setMatchStatus = function(req, res){
	var matchId = req.params.matchId;
	var ticketId = req.params.ticketId;
	var statusInfo = req.params.statusInfo;
	return res.status(400).send(req.params);
};