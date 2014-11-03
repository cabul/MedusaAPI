'use strict';

var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Match = mongoose.model('Match'),
	Ticket = mongoose.model('Ticket');

exports.dbdisplay = function (req, res){
	var display;
	Ticket.find({}, function (err, tickets){
		if(err) return res.status(500).send('internal server error');
		display = '====TICKETS====\n';
		if(tickets.length === 0){ 
			display += 'There are no tickets';
		}else{
			tickets.forEach(function (ticket){
				display += JSON.stringify(ticket)+'\n';
			});
		}

		Match.find({}, function(err, matches){
			if(err) res.status(500).send('internal server error');
			display += '\n====MATCHES====\n';
			if(matches.length === 0){ 
				display += 'There are no matches';
			}else{
				matches.forEach(function (match) {
					display += JSON.stringify(match)+'\n';
				});
			}
			res.send(display);
		});
	});
};

exports.dbpurge = function (req, res){
	Ticket.remove({}, function(err) {
		if(err)console.log('error while removing Ticket documents');
   		else{console.log('tickets removed');}
	});
	Match.remove({}, function(err){
		if(err)console.log('error while removing Match documents');
		else{console.log('matches removed');}
	});
	res.send('database cleared');
};
