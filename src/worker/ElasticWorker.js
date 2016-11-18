import elasticsearch from 'elasticsearch';
import Segmenter from 'node-analyzer';
import pool from '../util/pool';

const segmenter = new Segmenter();

const client = new elasticsearch.Client({
  host: 'http://es.biliworld.com/',
  requestTimeout: 60000,
  log: 'info'
});

export default class ElasticWorker {

  start(col) {
    pool.acquire((err, db) => {
      if (err) {
        pool.release(db);
        console.log('connect to mongodb failed');
      } else {
        this.begin(db, col);
      }
    });
  }

  getBulk(list, col) {
    const res = [];
    list.forEach((_item) => {
      const item = _item;
      res.push({ index: { _index: 'yun', _type: col, _id: item._id } });
      delete item._id;
      delete item.done;
      const suggest = [];
      const arr = item.filelist || [];
      arr.forEach((tmp) => {
        suggest.push(tmp.server_filename);
      });
      const str = suggest.join('');
      const tags = segmenter.analyze(str).split(' ');
      item.tags = tags.filter(tag => Buffer.byteLength(tag, 'utf8') > 4);
      res.push(item);
    });
    return res;
  }

  getUpdate(list) {
    const res = [];
    list.forEach((item) => {
      res.push({ updateOne: { filter: { _id: item.data_id }, update: { $set: { done: 6 } }, upsert: true } });
    });
    return res;
  }

  begin(db, col) {
    db.collection(col).find({ done: 0 }).limit(1000)
      .toArray()
      .then((list) => {
        client.bulk({
          index: 'yun',
          body: this.getBulk(list, col)
        }, (err) => {
          if (err) {
            console.log(`index ${col} err ${err}`);
            this.begin(db, col);
          } else if (list.length > 0) {
            console.log(`index ${list.length} success`);
            db.collection(col).bulkWrite(this.getUpdate(list), { ordered: false, w: 1 }, (err, res) => {
              if (err) {
                console.log(err);
              }
              console.log(`update ${res.modifiedCount} from ${res.matchedCount}`);
              this.begin(db, col);
            });
          } else {
            pool.release(db);
            console.log(`${new Date().toLocaleString()} elastic worker wait for 1200s to start again`);
            setTimeout(() => { this.start(); }, 1200000);
          }
        });
      });
  }
}
