'use strict';

var api = require('../../app/controllers/api');

module.exports = function(app) {
	app.route('/api/requestTicket').post(api.ticket);
  app.route('/api/cancelTicket').post(api.cancel);
	app.route('/api/requestMatch').post(api.match);
	app.route('/api/waitTurn').post(api.wait);
	app.route('/api/submitTurn').post(api.submit);
	app.route('/api/getPlayers').post(api.players);
	app.route('/api/retirePlayer').post(api.retire);
  app.route('/api/getTurns').post(api.turns);
};
