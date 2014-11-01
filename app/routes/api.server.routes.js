'use strict';

var api = require('../../app/controllers/api');

module.exports = function(app) {

	app.route('/requestTicket').post(api.requestTicket);
	app.route('/requestMatch').post(api.requestMatch);
	app.route('/waitTurn').post(api.waitTurn);
	app.route('/submitTurn').post(api.submitTurn);
	app.route('/getMatchStatus').post(api.getMatchStatus);
	app.route('/setMatchStatus').post(api.setMatchStatus);

};
