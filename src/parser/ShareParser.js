import md5 from 'md5';
import async from 'async';
import Q from 'q';
import { read } from '../util/fetch';
import pool from '../util/pool';
import { Share } from '../models';

export default class ShareParser {

  start() {
    const deferred = Q.defer();
    Share.findAll({
      limit: 100,
      where: {
        down: 6,
        done: 0,
      },
      order: [
        ['id', 'ASC'],
      ]
    }).then((list) => {
      if (list.length > 10) {
        deferred.resolve(this.begin(list));
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  }

  save(page, done = 0) {
    page.set('done', done);
    return page.save();
  }

  json(data) {
    let res;
    try {
      res = JSON.parse(data);
    } catch (err) { }
    return res;
  }

  begin(list) {
    const deferred = Q.defer();
    async.mapLimit(list, 1, (_page, callback) => {
      const page = _page;
      console.log(`parse ${page.url}`);
      const con = read(page.url).toString('utf-8');
      const sindex = con.indexOf('window.yunData = ');
      if (sindex === -1) {
        console.log(`${page.url} has no share data`);
        this.save(page, 6)
          .done(() => {
            callback(null, null);
          });
      } else {
        let data = con.substring(sindex + 17);
        data = data.substring(0, data.indexOf('}();') - 3).replace(/;/g, '');
        data = this.json(data) || { feedata: { records: [] } };
        const shares = data.feedata.records || [];
        if (shares.length == 0) {
          this.save(page, 6)
            .done(() => {
              callback(null, null);
            });
        } else {
          shares.forEach((_item) => {
            const item = _item;
            item._id = item.data_id;
            item.done = 0;
          });
          pool.acquire((err, db) => {
            if (err) {
              pool.release(db);
              deferred.reject(`connection to mongodb ${err}`);
            } else {
              //this.index(shares);
              db.collection('share').insertMany(shares, { ordered: false }, (err, res) => {
                console.log(`insert ${res.insertedCount} from ${shares.length} shares`);
                pool.release(db);
                const { start, uk } = this.parse(page.url);
                const count = data.feedata.total_count;
                if ((start + 20) < count) {
                  const url = `http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=${uk}&limit=20&start=${start + 20}&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1`;
                  const task = { type: page.type, uid: md5(url), url, down: 0, done: 0 };
                  this.addTask(task)
                    .then(() => {
                      const res = this.save(page, 6);
                      return res;
                    })
                    .done(() => {
                      callback(null, null);
                    });
                } else {
                  this.save(page, 6)
                    .done(() => {
                      callback(null, null);
                    });
                }
              });
            }
          });
        }
      }
    }, () => {
      deferred.resolve(this.start());
    });
    return deferred.promise;
  }

  addTask(task) {
    const deferred = Q.defer();
    Share.findOrCreate({ where: { uid: task.uid }, defaults: task })
      .spread((task, created) => {
        if (created) {
          console.log(`add task ${task.url}`);
        }
      })
      .done(() => {
        deferred.resolve();
      });
    return deferred.promise;
  }

  parse(url) {
    const arr = url.split(/[?&]/);
    let start = 2147483647;
    let uk = '';
    arr.forEach((item) => {
      if (item.startsWith('start')) {
        const tmp = item.split('=');
        if (tmp.length === 2) {
          start = parseInt(tmp[1], 10);
        }
      }
      if (item.startsWith('query_uk') || item.startsWith('uk')) {
        const tmp = item.split('=');
        uk = tmp[1];
      }
    });
    return { start, uk };
  }
}
