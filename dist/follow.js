'use strict';

var _FollowWorker = require('./worker/FollowWorker');

var _FollowWorker2 = _interopRequireDefault(_FollowWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var followworker = new _FollowWorker2.default();
followworker.start();