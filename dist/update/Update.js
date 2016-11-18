'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserUpdate = function () {
  function UserUpdate() {
    _classCallCheck(this, UserUpdate);
  }

  _createClass(UserUpdate, [{
    key: 'start',
    value: function start() {
      var _this = this;

      _pool2.default.acquire(function (err, db) {
        if (err) {
          _pool2.default.release(db);
          console.log('connect to mongodb failed');
        } else {
          _this.begin(db, 0);
        }
      });
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
    value: function begin(db, offset) {
      var _this3 = this;

      db.collection('user').find({}).skip(offset).limit(100).toArray().then(function (users) {
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
        _this3.addTasks(utask, _models.User).then(function () {
          var res = _this3.addTasks(stask, _models.Share);
          return res;
        }).done(function () {
          if (users.length > 0) {
            _this3.begin(db, offset + 100);
          } else {
            _pool2.default.release(db);
            console.log('insert task finished');
          }
        });
      });
    }
  }]);

  return UserUpdate;
}();

exports.default = UserUpdate;