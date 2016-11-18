'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Share = exports.User = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mysql = new _sequelize2.default('yun', 'root', 'root', {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 5,
    idle: 10000
  }
});

var User = mysql.import(_path2.default.join(__dirname, './User'));

var Share = mysql.import(_path2.default.join(__dirname, './Share'));

exports.User = User;
exports.Share = Share;