'use strict';

var _FanWorker = require('./worker/FanWorker');

var _FanWorker2 = _interopRequireDefault(_FanWorker);

var _FollowWorker = require('./worker/FollowWorker');

var _FollowWorker2 = _interopRequireDefault(_FollowWorker);

var _ShareWorker = require('./worker/ShareWorker');

var _ShareWorker2 = _interopRequireDefault(_ShareWorker);

var _UserParser = require('./parser/UserParser');

var _UserParser2 = _interopRequireDefault(_UserParser);

var _ShareParser = require('./parser/ShareParser');

var _ShareParser2 = _interopRequireDefault(_ShareParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fanworker = new _FanWorker2.default();
fanworker.start();

var followworker = new _FollowWorker2.default();
followworker.start();

var shareworker = new _ShareWorker2.default();
shareworker.start();

var userparser = new _UserParser2.default();
userparser.start();

var shareparser = new _ShareParser2.default();
shareparser.start();