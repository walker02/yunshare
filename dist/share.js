'use strict';

var _ShareWorker = require('./worker/ShareWorker');

var _ShareWorker2 = _interopRequireDefault(_ShareWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shareworker = new _ShareWorker2.default();
shareworker.start();