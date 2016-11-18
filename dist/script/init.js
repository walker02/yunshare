'use strict';

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hots = require('../../data/hot.json');

var list = hots.hotuser_list;

list.forEach(function (item) {
  var user = { uk: item.hot_uk, name: item.hot_uname, avatar: item.avatar_url, intro: item.intro, type: item.user_type, vip: item.is_vip, fans: item.fans_count, follows: item.follow_count, shares: item.pubshare_count, albums: item.album_count };
  _models.User.create(user).then(function () {
    var arr = [];
    if (user.fans > 0) {
      var url = 'http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=' + user.uk + '&limit=20&start=0';
      arr.push({ type: 'fan', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 });
    }
    if (user.follows > 0) {
      var _url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + user.uk + '&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
      arr.push({ type: 'follow', uid: (0, _md2.default)(_url), url: _url, down: 0, done: 0 });
    }
    if (user.shares > 0) {
      var _url2 = 'https://pan.baidu.com/wap/share/home?uk=' + user.uk + '&start=0';
      arr.push({ type: 'share', uid: (0, _md2.default)(_url2), url: _url2, down: 0, done: 0 });
    }
    _models.Task.bulkCreate(arr);
  });
});