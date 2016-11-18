'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = exports.write = exports.exist = exports.getname = undefined;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = process.platform == 'win32' ? 'd:/data' : process.env.HOME + '/data';

function getname(page) {
  var url = page.url;
  var ext = page.ext || 'html';
  var name = (0, _md2.default)(url);
  var str1 = name.substring(0, 2);
  var str2 = name.substring(2, 4);
  return _path2.default.join(root, str1, str2, name + '.' + ext);
}

function exist(page) {
  try {
    _fsExtra2.default.statSync(getname(page));
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
}

function write(page, con) {
  var file = getname(page);
  _fsExtra2.default.ensureDirSync(_path2.default.dirname(file));
  _fsExtra2.default.writeFileSync(file, con);
}

function read(page) {
  var file = getname(page);
  console.log('read ' + page.url + ' in ' + file);
  var res = '[]';
  try {
    res = _fsExtra2.default.readFileSync(file);
  } catch (err) {
    console.log('' + err);
  }
  return res;
}

exports.getname = getname;
exports.exist = exist;
exports.write = write;
exports.read = read;