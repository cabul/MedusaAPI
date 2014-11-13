'use strict';

var _ = require('lodash');

module.exports = _.extend(

  require('./api/api.ticket'),
  require('./api/api.player'),
  require('./api/api.turns'),
  require('./api/api.match')

);
