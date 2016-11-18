'use strict';

var _models = require('../models');

_models.User.sync({}).then(function () {
  return _models.Share.sync();
}).done(function () {
  return process.exit(0);
});