'use strict';

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _UserParser = require('./parser/UserParser');

var _UserParser2 = _interopRequireDefault(_UserParser);

var _ShareParser = require('./parser/ShareParser');

var _ShareParser2 = _interopRequireDefault(_ShareParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userparser = new _UserParser2.default();
var shareparser = new _ShareParser2.default();

function start() {
  (0, _q2.default)(0).then(function () {
    return shareparser.start();
  }).then(function () {
    return userparser.start();
  }).done(function () {
    console.log(new Date().toLocaleString() + ' parser worker wait for 1200s to start again');
    setTimeout(function () {
      start();
    }, 1200000);
  });
}

start();