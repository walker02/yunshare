'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _nodeAnalyzer = require('node-analyzer');

var _nodeAnalyzer2 = _interopRequireDefault(_nodeAnalyzer);

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var segmenter = new _nodeAnalyzer2.default();

var client = new _elasticsearch2.default.Client({
  host: 'http://localhost:9200/',
  requestTimeout: 60000,
  log: 'info'
});

var ElasticWorker = function () {
  function ElasticWorker() {
    _classCallCheck(this, ElasticWorker);
  }

  _createClass(ElasticWorker, [{
    key: 'start',
    value: function start(col) {
      var _this = this;

      _pool2.default.acquire(function (err, db) {
        if (err) {
          _pool2.default.release(db);
          console.log('connect to mongodb failed');
        } else {
          _this.begin(db, col);
        }
      });
    }
  }, {
    key: 'getBulk',
    value: function getBulk(list, col) {
      var res = [];
      list.forEach(function (_item) {
        var item = _item;
        res.push({ index: { _index: 'yun', _type: col, _id: item._id } });
        delete item._id;
        delete item.done;
        var suggest = [];
        var arr = item.filelist || [];
        arr.forEach(function (tmp) {
          suggest.push(tmp.server_filename);
        });
        var str = suggest.join('');
        var tags = segmenter.analyze(str).split(' ');
        item.tags = tags.filter(function (tag) {
          return Buffer.byteLength(tag, 'utf8') > 4;
        });
        res.push(item);
      });
      return res;
    }
  }, {
    key: 'getUpdate',
    value: function getUpdate(list) {
      var res = [];
      list.forEach(function (item) {
        res.push({ updateOne: { filter: { _id: item.data_id }, update: { $set: { done: 6 } }, upsert: true } });
      });
      return res;
    }
  }, {
    key: 'begin',
    value: function begin(db, col) {
      var _this2 = this;

      db.collection(col).find({ done: 0 }).limit(1000).toArray().then(function (list) {
        client.bulk({
          index: 'yun',
          body: _this2.getBulk(list, col)
        }, function (err) {
          if (err) {
            console.log('index ' + col + ' err ' + err);
            _this2.begin(db, col);
          } else if (list.length > 0) {
            console.log('index ' + list.length + ' success');
            db.collection(col).bulkWrite(_this2.getUpdate(list), { ordered: false, w: 1 }, function (err, res) {
              if (err) {
                console.log(err);
              }
              console.log('update ' + res.modifiedCount + ' from ' + res.matchedCount);
              _this2.begin(db, col);
            });
          } else {
            _pool2.default.release(db);
            console.log(new Date().toLocaleString() + ' elastic worker wait for 1200s to start again');
            setTimeout(function () {
              _this2.start();
            }, 1200000);
          }
        });
      });
    }
  }]);

  return ElasticWorker;
}();

exports.default = ElasticWorker;