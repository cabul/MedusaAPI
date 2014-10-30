'use strict';

var client = require('../../app/controllers/client');

module.exports = function(app) {

	app.route('/api/requestTicket/:phoneId?').all(client.requestTicket);
	app.route('/api/requestMatch').post(client.requestMatch);
	app.route('/api/waitTurn').post(client.waitTurn);
	app.route('/api/submitTurn/:matchId?/:ticketId?/:turnId?/:turnInfo?').all(client.submitTurn);
	app.route('/api/getMatchStatus').post(client.getMatchStatus);
	app.route('/api/setMatchStatus').post(client.setMatchStatus);
	app.route('/db').all(client.db);
};
