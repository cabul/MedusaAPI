'use strict';

module.exports = function (app){
	app.route('/showTest').get(require('../../app/controllers/test').showtest);
};