'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

var _files = require('../util/files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function clean(offset) {
  return _models2.default.findAll({
    offset: offset,
    limit: 1000,
    where: {
      type: ['fan', 'follow'],
      done: 4
    },
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      _async2.default.mapLimit(list, 1, function (item, callback) {
        var file = (0, _files.getname)(item);
        console.log('remove ' + file);
        _fsExtra2.default.remove(file);
        item.set('down', 0);
        item.set('done', 0);
        item.save().done(function () {
          callback(null, null);
        });
      }, function () {
        clean(offset + list.length);
      });
    }
  });
}

clean(0);