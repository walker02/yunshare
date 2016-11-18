'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _fetch = require('../util/fetch');

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserParser = function () {
  function UserParser() {
    _classCallCheck(this, UserParser);
  }

  _createClass(UserParser, [{
    key: 'start',
    value: function start() {
      var _this = this;

      _models.User.findAll({
        limit: 100,
        where: {
          down: 6,
          done: 0
        },
        order: [['id', 'ASC']]
      }).then(function (list) {
        if (list.length > 0) {
          _this.begin(list);
        } else {
          console.log(new Date().toLocaleString() + ' user parser wait for 1200s to start again');
          setTimeout(function () {
            _this.start();
          }, 1200000);
        }
      });
    }
  }, {
    key: 'save',
    value: function save(page) {
      var done = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      page.set('done', done);
      return page.save();
    }
  }, {
    key: 'addTask',
    value: function addTask(task, model) {
      var deferred = _q2.default.defer();
      model.findOrCreate({ where: { uid: task.uid }, defaults: task }).spread(function (task, created) {
        if (created) {
          console.log('add task ' + task.url);
        }
      }).done(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }
  }, {
    key: 'addTasks',
    value: function addTasks(tasks, model) {
      var _this2 = this;

      var deferred = _q2.default.defer();
      _async2.default.mapLimit(tasks, 1, function (task, callback) {
        _this2.addTask(task, model).done(function () {
          callback(null, null);
        });
      }, function () {
        deferred.resolve();
      });
      return deferred.promise;
    }
  }, {
    key: 'begin',
    value: function begin(list) {
      var _this3 = this;

      var deferred = _q2.default.defer();
      _async2.default.mapLimit(list, 1, function (_page, callback) {
        var page = _page;
        console.log('parse ' + page.url);
        var con = (0, _fetch.read)(page.url);
        var data = JSON.parse(con);
        if (con == '[]' || data.errno !== 0) {
          console.log('' + con);
          _fsExtra2.default.remove((0, _fetch.getfile)(page.url));
          page.set('down', 0);
          _this3.save(page).done(function () {
            callback(null, null);
          });
        } else {
          (function () {
            var users = data.fans_list || data.follow_list;
            users.forEach(function (_user) {
              var user = _user;
              user._id = user.fans_uk || user.follow_uk;
              user.uk = user._id;
              user.uname = user.fans_uname || user.follow_uname;
              delete user.fans_uk;
              delete user.follow_uk;
              delete user.fans_uname;
              delete user.follow_uname;
            });
            if (users.length == 0) {
              _this3.save(page, 6).done(function () {
                callback(null, null);
              });
            } else {
              _pool2.default.acquire(function (err, db) {
                if (err) {
                  _pool2.default.release(db);
                  deferred.reject('connection to mongodb ' + err);
                } else {
                  db.collection('user').insertMany(users, { ordered: false }, function (err, res) {
                    console.log('insert ' + res.insertedCount + ' from ' + users.length + ' users');
                    _pool2.default.release(db);

                    var utask = [];
                    var stask = [];
                    users.forEach(function (user) {
                      if (user.fans_count > 0) {
                        var url = 'http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=' + user.uk + '&limit=20&start=0';
                        utask.push({ type: 'fan', uid: (0, _md2.default)(url), url: url, down: 0, done: 0 });
                      }
                      if (user.follow_count > 0) {
                        var _url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + user.uk + '&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
                        utask.push({ type: 'follow', uid: (0, _md2.default)(_url), url: _url, down: 0, done: 0 });
                      }
                      if (user.pubshare_count > 0) {
                        var _url2 = 'https://pan.baidu.com/wap/share/home?uk=' + user.uk + '&start=0';
                        stask.push({ type: 'share', uid: (0, _md2.default)(_url2), url: _url2, down: 0, done: 0 });
                      }
                    });

                    var _parse = _this3.parse(page.url),
                        start = _parse.start,
                        uk = _parse.uk;

                    var count = data.total_count;
                    if (start + 20 < count) {
                      var url = _this3.getUrl(page, uk, start + 20);
                      utask.push({ type: page.type, uid: (0, _md2.default)(url), url: url, down: 0, done: 0 });
                    }

                    _this3.addTasks(utask, _models.User).then(function () {
                      var res = _this3.addTasks(stask, _models.Share);
                      return res;
                    }).then(function () {
                      var res = _this3.save(page, 6);
                      return res;
                    }).done(function () {
                      callback(null, null);
                    });
                  });
                }
              });
            }
          })();
        }
      }, function () {
        deferred.resolve(_this3.start());
      });
      return deferred.promise;
    }
  }, {
    key: 'getUrl',
    value: function getUrl(page, uk, start) {
      var res = '';
      if (page.type == 'fan') {
        res = 'http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=' + uk + '&limit=20&start=' + start;
      } else {
        res = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + uk + '&limit=20&start=' + start + '&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
      }
      return res;
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
  }]);

  return UserParser;
}();

exports.default = UserParser;