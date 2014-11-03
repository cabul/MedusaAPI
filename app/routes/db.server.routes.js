'use strict';

var db = require('../../app/controllers/db');

module.exports = function(app) {

	app.route('/db/display').post(db.dbdisplay);
	app.route('/db/purge').post(db.dbpurge);

};