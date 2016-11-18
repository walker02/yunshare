'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _sleepTime = require('sleep-time');

var _sleepTime2 = _interopRequireDefault(_sleepTime);

var _fetch = require('../util/fetch');

var _models = require('../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShareWorker = function () {
  function ShareWorker() {
    _classCallCheck(this, ShareWorker);
  }

  _createClass(ShareWorker, [{
    key: 'start',
    value: function start() {
      var _this = this;

      _models.Share.findAll({
        limit: 100,
        where: {
          down: 0,
          done: 0
        },
        order: [['id', 'ASC']]
      }).then(function (list) {
        if (list.length > 0) {
          _this.begin(list);
        } else {
          console.log(new Date().toLocaleString() + ' share worker wait for 1200s to start again');
          setTimeout(function () {
            _this.start();
          }, 1200000);
        }
      });
    }
  }, {
    key: 'limit',
    value: function limit() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

      (0, _sleepTime2.default)(time);
    }
  }, {
    key: 'begin',
    value: function begin(list) {
      var _this2 = this;

      var deferred = _q2.default.defer();
      _async2.default.mapLimit(list, 1, function (_page, callback) {
        var page = _page;
        (0, _fetch.fetch)(page.url).then(function () {
          _this2.limit();
          page.set('down', 6);
          return page.save();
        }).catch(function (err) {
          console.log('' + err);
        }).done(function () {
          callback(null, null);
        });
      }, function () {
        deferred.resolve(_this2.start());
      });
      return deferred.promise;
    }
  }]);

  return ShareWorker;
}();

exports.default = ShareWorker;