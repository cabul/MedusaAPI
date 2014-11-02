'use strict';

var api = require('../../app/controllers/api');

module.exports = function(app) {

	app.route('/api/requestTicket').post(api.requestTicket);
	app.route('/api/requestMatch').post(api.requestMatch);
	app.route('/api/waitTurn').post(api.waitTurn);
	app.route('/api/submitTurn').post(api.submitTurn);
	app.route('/api/getMatchStatus').post(api.getMatchStatus);
	app.route('/api/setMatchStatus').post(api.setMatchStatus);
};
