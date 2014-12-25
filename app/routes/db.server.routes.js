'use strict';

var db = require('../../app/controllers/db');

module.exports = function(app) {

	app.route('/db/display').all(db.dbdisplay);
	app.route('/db/purge').all(db.dbpurge);

};