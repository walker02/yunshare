'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetch;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _files = require('../util/files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//"Referer", "https://yun.baidu.com/share/home?uk=1949404764#category/type=0")

_request2.default.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36',
    Referer: 'https://yun.baidu.com/share/home?uk=23432432#category/type=0'
  },
  timeout: 12000,
  forever: true,
  encoding: null
});

/**
 * page: {uid, url, down = 0, done}
 * reject: http status code != 200
 * success: 1. exist return '' 2. download return html content
 */
function fetch(_page) {
  var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var page = _page;
  console.log('down ' + page.id + ':' + page.url + ' started');
  var deferred = _q2.default.defer();
  if ((0, _files.exist)(page) && !override) {
    console.log('down ' + page.id + ':' + page.url + ' exist');
    page.set('down', 6);
    deferred.resolve('');
  } else {
    var options = {
      url: page.url
    };
    (0, _request2.default)(options, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log('down ' + page.id + ':' + page.url + ' success ' + res.statusCode);
        deferred.resolve(body);
      } else {
        page.set('down', 4);
        deferred.reject('down ' + page.id + ':' + page.url + ' err:' + err);
      }
    }).on('data', function () {}).on('response', function () {});
  }
  return deferred.promise;
}