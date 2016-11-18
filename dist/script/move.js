'use strict';

var _pool = require('../util/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function begin(db, col, offset) {
  db.collection(col).find({}).skip(offset).limit(1000).toArray().then(function (list) {
    if (list.length > 0) {
      list.forEach(function (item) {
        item._id = item.data_id;
      });
      db.collection('share').insertMany(list, { ordered: false }, function (err, res) {
        if (err) {
          console.log(err);
        }
        console.log('insert ' + res.insertedCount + ' from ' + list.length + ' shares');
        begin(db, col, offset + list.length);
      });
    } else {
      _pool2.default.release(db);
      process.exit(0);
    }
  });
}

function start(col) {
  _pool2.default.acquire(function (err, db) {
    if (err) {
      _pool2.default.release(db);
      console.log('connect to mongodb failed');
    } else {
      begin(db, col, 0);
    }
  });
}

start('share1');