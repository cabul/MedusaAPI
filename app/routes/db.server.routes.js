'use strict';

var db = require('../../app/controllers/db');

module.exports = function(app) {

	app.route('/db/display').get(db.dbdisplay);
	app.route('/db/purge').get(db.dbpurge);

};