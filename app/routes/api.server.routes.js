'use strict';

var api = require('../../app/controllers/api'),
		turns = require('../../app/controllers/api/api.turns');

module.exports = function(app) {

	app.route('/api/ticket').post(api.ticket);
	app.route('/api/match').post(api.match);
	app.route('/api/wait').post(turns.wait);
	app.route('/api/submit').post(turns.submit);
	app.route('/api/players').post(api.players);
	app.route('/api/retire').post(api.retire);
  app.route('/api/turns').post(api.turns);
	//app.route('/api/getMatchStatus').post(api.getMatchStatus);
	//app.route('/api/setMatchStatus').post(api.setMatchStatus);
};
