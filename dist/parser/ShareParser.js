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

var _fetch = require('../util/fetch');

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShareParser = function () {
  function ShareParser() {
    _classCallCheck(this, ShareParser);
  }

  _createClass(ShareParser, [{
    key: 'start',
    value: function start() {
      var _this = this;

      var deferred = _q2.default.defer();
      _models.Share.findAll({
        limit: 100,
        where: {
          down: 6,
          done: 0
        },
        order: [['id', 'ASC']]
      }).then(function (list) {
        if (list.length > 10) {
          deferred.resolve(_this.begin(list));
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    }
  }, {
    key: 'save',
    value: function save(page) {
      var done = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      page.set('done', done);
      return page.save();
    }
  }, {
    key: 'json',
    value: function json(data) {
      var res = void 0;
      try {
        res = JSON.parse(data);
      } catch (err) {}
      return res;
    }
  }, {
    key: 'begin',
    value: function begin(list) {
      var _this2 = this;

      var deferred = _q2.default.defer();
      _async2.default.mapLimit(list, 1, function (_page, callback) {
        var page = _page;
        console.log('parse ' + page.url);
        var con = (0, _fetch.read)(page.url).toString('utf-8');
        var sindex = con.indexOf('window.yunData = ');
        if (sindex === -1) {
          console.log(page.url + ' has no share data');
          _this2.save(page, 6).done(function () {
            callback(null, null);
          });
        } else {
          (function () {
            var data = con.substring(sindex + 17);
            data = data.substring(0, data.indexOf('}();') - 3).replace(/;/g, '');
            data = _this2.json(data) || { feedata: { records: [] } };
            var shares = data.feedata.records || [];
            if (shares.length == 0) {
              _this2.save(page, 6).done(function () {
                callback(null, null);
              });
            } else {
              shares.forEach(function (_item) {
                var item = _item;
                item._id = item.data_id;
                item.done = 0;
              });
              _pool2.default.acquire(function (err, db) {
                if (err) {
                  _pool2.default.release(db);
                  deferred.reject('connection to mongodb ' + err);
                } else {
                  //this.index(shares);
                  db.collection('share').insertMany(shares, { ordered: false }, function (err, res) {
                    console.log('insert ' + res.insertedCount + ' from ' + shares.length + ' shares');
                    _pool2.default.release(db);

                    var _parse = _this2.parse(page.url),
                        start = _parse.start,
                        uk = _parse.uk;

                    var count = data.feedata.total_count;
                    if (start + 20 < count) {
                      var url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=' + uk + '&limit=20&start=' + (start + 20) + '&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';
                      var task = { type: page.type, uid: (0, _md2.default)(url), url: url, down: 0, done: 0 };
                      _this2.addTask(task).then(function () {
                        var res = _this2.save(page, 6);
                        return res;
                      }).done(function () {
                        callback(null, null);
                      });
                    } else {
                      _this2.save(page, 6).done(function () {
                        callback(null, null);
                      });
                    }
                  });
                }
              });
            }
          })();
        }
      }, function () {
        deferred.resolve(_this2.start());
      });
      return deferred.promise;
    }
  }, {
    key: 'addTask',
    value: function addTask(task) {
      var deferred = _q2.default.defer();
      _models.Share.findOrCreate({ where: { uid: task.uid }, defaults: task }).spread(function (task, created) {
        if (created) {
          console.log('add task ' + task.url);
        }
      }).done(function () {
        deferred.resolve();
      });
      return deferred.promise;
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

  return ShareParser;
}();

exports.default = ShareParser;