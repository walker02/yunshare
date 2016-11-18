'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _genericPool = require('generic-pool');

var _mongodb = require('mongodb');

var url = 'mongodb://localhost:27017/yun';

var pool = new _genericPool.Pool({
  name: 'mongodb',
  create: function create(callback) {
    _mongodb.MongoClient.connect(url, function (err, db) {
      if (err) return callback(err);
      callback(null, db);
    });
  },
  destroy: function destroy(db) {
    db.close();
  },

  max: 1,
  min: 1,
  idleTimeoutMillis: 300000,
  log: false
});

exports.default = pool;