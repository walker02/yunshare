'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exist = exports.write = exports.read = exports.getfile = exports.fetch = undefined;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = process.platform == 'win32' ? 'd:/data' : process.env.HOME + '/data';

var request = _request2.default.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36',
    Referer: 'https://yun.baidu.com/share/home?uk=23432432#category/type=0'
  },
  timeout: 30000
});

function getfile(url) {
  var name = (0, _md2.default)(url);
  var str1 = name.substring(0, 2);
  var str2 = name.substring(2, 4);
  return _path2.default.join(root, str1, str2, '' + name);
}

function exist(url) {
  try {
    _fsExtra2.default.statSync(getfile(url));
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
}

function write(url, con) {
  var file = getfile(url);
  _fsExtra2.default.ensureDirSync(_path2.default.dirname(file));
  _fsExtra2.default.writeFileSync(file, con);
}

function read(url) {
  var file = getfile(url);
  return _fsExtra2.default.readFileSync(file);
}

function fetch(url) {
  console.log('down ' + url + ' started');
  var deferred = _q2.default.defer();
  var file = getfile(url);
  _fsExtra2.default.ensureDirSync(_path2.default.dirname(file));
  var stream = request.get(url).on('error', function (err) {
    deferred.reject('down ' + url + ':' + err);
  }).on('response', function (res) {
    if (res.statusCode !== 200) {
      deferred.reject('down ' + url + ':' + res.statusCode);
    } else {
      console.log('down ' + url + ':' + res.statusCode);
    }
  }).pipe(_fsExtra2.default.createWriteStream('' + file));

  stream.on('finish', function () {
    deferred.resolve();
  });
  return deferred.promise;
}

exports.fetch = fetch;
exports.getfile = getfile;
exports.read = read;
exports.write = write;
exports.exist = exist;