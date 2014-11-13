'use strict';

var api = require('../../app/controllers/api');

module.exports = function(app) {
	app.route('/api/ticket').post(api.ticket);
	app.route('/api/match').post(api.match);
	app.route('/api/wait').post(api.wait);
	app.route('/api/submit').post(api.submit);
	app.route('/api/players').post(api.players);
	app.route('/api/retire').post(api.retire);
  app.route('/api/turns').post(api.turns);
};
