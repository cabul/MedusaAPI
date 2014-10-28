'use strict';

var client = require('../../app/controllers/client');

module.exports = function(app) {

	app.route('/api/requestTicket/:phoneId?').all(client.requestTicket);
	app.route('/api/requestMatch/:ticketId?').all(client.requestMatch);
	app.route('/api/waitTurn/:matchId?/:ticketId?/:turnId?').all(client.waitTurn);
	app.route('/api/submitTurn/:matchId?/:ticketId?/:turnId?/:turnInfo?').all(client.submitTurn);
	app.route('/api/getMatchStatus/:matchId?/:ticketId?').all(client.getMatchStatus);
	app.route('/api/setMatchStatus/:matchId?/:ticketId?/:statusInfo?').all(client.setMatchStatus);
	app.route('/db').all(client.db);
};
