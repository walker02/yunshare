'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _sleepTime = require('sleep-time');

var _sleepTime2 = _interopRequireDefault(_sleepTime);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _fetch = require('../util/fetch');

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YunParser = function () {
  function YunParser() {
    _classCallCheck(this, YunParser);
  }

  _createClass(YunParser, [{
    key: 'query',
    value: function query() {
      return _models2.default.findAll({
        limit: 10,
        where: {
          done: 0
        },
        order: [['id', 'ASC']]
      });
    }
  }, {
    key: 'init',
    value: function init() {
      return (0, _q2.default)(0);
    }
  }, {
    key: '_update',
    value: function _update() {}
  }, {
    key: 'update',
    value: function update() {
      // delete file from md5(url) where done=4
      // update t_yun set down=0,done=0 where done=4
      // insert into t_yun where user not exist in t_yun
      return (0, _q2.default)(0);
    }
  }, {
    key: 'limit',
    value: function limit() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

      (0, _sleepTime2.default)(time);
    }
  }, {
    key: 'add',
    value: function add(user) {
      console.log('add user ' + user.id + ':' + user.uk);
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
      return _models2.default.bulkCreate(arr);
    }
  }, {
    key: 'addTask',
    value: function addTask(task) {
      var deferred = _q2.default.defer();
      _models2.default.findOrCreate({ where: { uid: task.uid }, defaults: task }).spread(function (task, created) {
        if (created) {
          console.log('add task ' + task.url);
        }
      }).done(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }
  }, {
    key: 'getUser',
    value: function getUser(item, name) {
      var user = { _id: item[name + '_uk'], uk: item[name + '_uk'], name: item[name + '_uname'], avatar: item.avatar_url, intro: item.intro, type: item.user_type, vip: item.is_vip, fans: item.fans_count, follows: item.follow_count, shares: item.pubshare_count, albums: item.album_count };
      return user;
    }
  }, {
    key: 'getShare',
    value: function getShare(item) {
      var share = { _id: item.data_id, uk: item.uk, type: item.feed_type, category: item.category, public: item.public, shareid: item.shareid, data_id: item.data_id, third: item.third, title: item.title, name: item.username, avatar: item.avatar_url, ctime: item.feed_time, desc: item.desc, filecount: item.filecount, filelist: JSON.stringify(item.filelist) };
      if (item.feed_type === 'album') {
        share.shareid = item.album_id;
        share.filecount = 0;
        share.filelist = '[]';
      }
      return share;
    }
  }, {
    key: 'parse',
    value: function parse(url) {
      var arr = url.split(/[?&]/);
      var start = 2147483647;
      var uk = '';
      arr.forEach(function (item) {
        if (item.startsWith('start')) {
          var tmp = item.split('=');
          if (tmp.length === 2) {
            start = parseInt(tmp[1], 10);
          }
        }
        if (item.startsWith('query_uk') || item.startsWith('uk')) {
          var _tmp = item.split('=');
          uk = _tmp[1];
        }
      });
      return { start: start, uk: uk };
    }
  }, {
    key: 'exist',
    value: function exist(arr, item, key) {
      var res = false;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tmp = _step.value;

          if (tmp[key] == item[key]) {
            res = true;
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return res;
    }
  }, {
    key: 'fan',
    value: function fan(opts) {
      var _this = this;

      var deferred = _q2.default.defer();
      var page = opts.page;
      var con = opts.con;
      if (!con || con.length == 0) {
        con = (0, _fetch.read)(opts.page);
      }
      var fans = JSON.parse(con);
      if (fans.errno !== 0) {
        this.limit(2000);
        page.set('done', 4);
        return (0, _q2.default)(0);
      }
      var list = fans.fans_list;
      var users = list.map(function (item) {
        return _this.getUser(item, 'fans');
      });
      if (list.length == 0) {
        return (0, _q2.default)(0);
      }
      _pool2.default.acquire(function (err, db) {
        if (err) {
          _pool2.default.release(db);
          deferred.reject('connection to mongodb ' + err);
        } else {
          db.collection('user').insertMany(users, { ordered: false }, function (err, res) {
            console.log('insert ' + res.insertedCount + ' from ' + list.length + ' users');
            _pool2.default.release(db);

            var _parse = _this.parse(opts.page.url),
                start = _parse.start,
                uk = _parse.uk;

            var count = fans.total_count;
            if (start + 20 < count) {
              var url = 'http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=' + uk + '&limit=20&start=' + (start + 20);
              var task = { type: 'fan', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 };
              _this.addTask(task).done(function () {
                deferred.resolve();
              });
            } else {
              deferred.resolve();
            }
          });
        }
      });
      return deferred.promise;
    }
  }, {
    key: 'follow',
    value: function follow(opts) {
      var _this2 = this;

      var deferred = _q2.default.defer();
      var page = opts.page;
      var con = opts.con;
      if (!con || con.length == 0) {
        con = (0, _fetch.read)(opts.page);
      }
      var follows = JSON.parse(con);
      if (follows.errno !== 0) {
        this.limit(2000);
        page.set('done', 4);
        return (0, _q2.default)(0);
      }
      var list = follows.follow_list;
      if (list.length == 0) {
        return (0, _q2.default)(0);
      }
      var users = list.map(function (item) {
        return _this2.getUser(item, 'follow');
      });
      _pool2.default.acquire(function (err, db) {
        if (err) {
          _pool2.default.release(db);
          deferred.reject('connection to mongodb ' + err);
        } else {
          db.collection('user').insertMany(users, { ordered: false }, function (err, res) {
            console.log('insert ' + res.insertedCount + ' from ' + list.length + ' users');
            _pool2.default.release(db);

            var _parse2 = _this2.parse(opts.page.url),
                start = _parse2.start,
                uk = _parse2.uk;

            var count = follows.total_count;
            if (start + 20 < count) {
              var url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + uk + '&limit=20&start=' + (start + 20) + '&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
              var task = { type: 'follow', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 };
              _this2.addTask(task).done(function () {
                deferred.resolve();
              });
            } else {
              deferred.resolve();
            }
          });
        }
      });
      return deferred.promise;
    }
  }, {
    key: 'share',
    value: function share(opts) {
      var _this3 = this;

      var deferred = _q2.default.defer();
      var page = opts.page;
      var con = opts.con;
      if (!con || con.length == 0) {
        con = (0, _fetch.read)(opts.page).toString('utf-8');
      }
      var sindex = con.indexOf('window.yunData = ');
      if (sindex === -1) {
        this.limit(35);
        page.set('done', 4);
        return (0, _q2.default)(0);
      }
      var data = con.substring(sindex + 17);
      data = data.substring(0, data.indexOf('}();') - 3).replace(/;/g, '');
      var tmp = JSON.parse(data);
      var shares = tmp.feedata.records;
      if (shares.length == 0) {
        return (0, _q2.default)(0);
      }
      shares.forEach(function (_item) {
        var item = _item;
        item._id = item.data_id;
      });
      _pool2.default.acquire(function (err, db) {
        if (err) {
          _pool2.default.release(db);
          deferred.reject('connection to mongodb ' + err);
        } else {
          db.collection('share').insertMany(shares, { ordered: false }, function (err, res) {
            console.log('insert ' + res.insertedCount + ' from ' + shares.length + ' shares');
            _pool2.default.release(db);

            var _parse3 = _this3.parse(opts.page.url),
                start = _parse3.start,
                uk = _parse3.uk;

            var count = tmp.feedata.total_count;
            if (start + 20 < count) {
              var url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + uk + '&limit=20&start=' + (start + 20) + '&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
              var task = { type: 'follow', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 };
              _this3.addTask(task).done(function () {
                deferred.resolve();
              });
            } else {
              deferred.resolve();
            }
          });
        }
      });
      return deferred.promise;
    }
  }]);

  return YunParser;
}();

exports.default = YunParser;