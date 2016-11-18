'use strict';

var _ElasticWorker = require('./worker/ElasticWorker');

var _ElasticWorker2 = _interopRequireDefault(_ElasticWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var worker = new _ElasticWorker2.default();
worker.start('share');