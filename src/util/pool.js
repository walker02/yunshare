import { Pool } from 'generic-pool';
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/yun';

const pool = new Pool({
  name: 'mongodb',
  create(callback) {
    MongoClient.connect(url, (err, db) => {
      if (err) return callback(err);
      callback(null, db);
    });
  },
  destroy(db) {
    db.close();
  },
  max: 1,
  min: 1,
  idleTimeoutMillis: 300000,
  log: false
});

export default pool;
