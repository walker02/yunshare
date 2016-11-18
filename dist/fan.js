'use strict';

var _FanWorker = require('./worker/FanWorker');

var _FanWorker2 = _interopRequireDefault(_FanWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fanworker = new _FanWorker2.default();
fanworker.start();