'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var file = _path2.default.join(__dirname, '../../test.html');
var con = _fsExtra2.default.readFileSync(file, 'utf-8');
var sin = con.indexOf('window.yunData = ');
var data = con.substring(sin + 17);
var ein = data.indexOf('}();');
data = data.substring(0, ein - 3).replace(/;/g, '');
console.log(data);
var shares = JSON.parse(data);
console.log(shares);