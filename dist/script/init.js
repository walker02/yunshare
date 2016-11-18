'use strict';

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hots = require('../../data/hot.json');

var list = hots.hotuser_list;

function init() {
  var deferred = _q2.default.defer();
  var uarr = [];
  var sarr = [];
  list.forEach(function (user) {
    if (user.fans_count > 0) {
      var url = 'http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=' + user.hot_uk + '&limit=20&start=0';
      uarr.push({ type: 'fan', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 });
    }
    if (user.follow_count > 0) {
      var _url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + user.hot_uk + '&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
      uarr.push({ type: 'follow', uid: (0, _md2.default)(_url), url: _url, down: 0, done: 0 });
    }
    if (user.pubshare_count > 0) {
      var _url2 = 'https://pan.baidu.com/wap/share/home?uk=' + user.hot_uk + '&start=0';
      sarr.push({ type: 'share', uid: (0, _md2.default)(_url2), url: _url2, down: 0, done: 0 });
    }
  });
  _models.User.bulkCreate(uarr).then(function () {
    return _models.Share.bulkCreate(sarr);
  }).done(function () {
    deferred.resolve();
  });
  return deferred.promise;
}

(0, _q2.default)(0).then(function () {
  return _models.User.sync({});
}).then(function () {
  return _models.Share.sync();
}).then(function () {
  return init();
}).done(function () {
  return process.exit(0);
});