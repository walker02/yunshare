'use strict';

var _FanWorker = require('./worker/FanWorker');

var _FanWorker2 = _interopRequireDefault(_FanWorker);

var _FollowWorker = require('./worker/FollowWorker');

var _FollowWorker2 = _interopRequireDefault(_FollowWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fanworker = new _FanWorker2.default();
fanworker.start();

var followworker = new _FollowWorker2.default();
followworker.start();