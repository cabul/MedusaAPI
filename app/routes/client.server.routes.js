'use strict';

var client = require('../../app/controllers/client');

module.exports = function(app) {
	app.route('/cuac').get(function(req, res){
		console.log('\ncuac\n');
	});
	app.route('/requestTicket/:phoneId').get(client.requestTicket);
	app.route('/requestMatch/:ticketId').get(client.requestMatch);
	app.route('/waitTurn/:matchId/:ticketId/:turnId').get(client.waitTurn);
	app.route('/submitTurn/:matchId/:ticketId/:turnId/:turnInfo').get(client.submitTurn);
	app.route('/getMatchStatus/:matchId/:ticketId').get(client.getMatchStatus);
	app.route('/setMatchStatus/:matchId/:ticketId/:statusInfo').get(client.setMatchStatus);

};
