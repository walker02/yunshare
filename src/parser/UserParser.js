import md5 from 'md5';
import fs from 'fs-extra';
import async from 'async';
import Q from 'q';
import { getfile, read } from '../util/fetch';
import pool from '../util/pool';
import { User, Share } from '../models';

export default class UserParser {

  start() {
    User.findAll({
      limit: 100,
      where: {
        down: 6,
        done: 0,
      },
      order: [
        ['id', 'ASC'],
      ]
    }).then((list) => {
      if (list.length > 0) {
        this.begin(list);
      } else {
        console.log(`${new Date().toLocaleString()} user parser wait for 1200s to start again`);
        setTimeout(() => { this.start(); }, 1200000);
      }
    });
  }

  save(page, done = 0) {
    page.set('done', done);
    return page.save();
  }

  addTask(task, model) {
    const deferred = Q.defer();
    model.findOrCreate({ where: { uid: task.uid }, defaults: task })
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

  addTasks(tasks, model) {
    const deferred = Q.defer();
    async.mapLimit(tasks, 1, (task, callback) => {
      this.addTask(task, model)
        .done(() => {
          callback(null, null);
        });
    }, () => {
      deferred.resolve();
    });
    return deferred.promise;
  }

  begin(list) {
    const deferred = Q.defer();
    async.mapLimit(list, 1, (_page, callback) => {
      const page = _page;
      console.log(`parse ${page.url}`);
      const con = read(page.url);
      const data = JSON.parse(con);
      if (con == '[]' || data.errno !== 0) {
        console.log(`${con}`);
        fs.remove(getfile(page.url));
        page.set('down', 0);
        this.save(page)
          .done(() => {
            callback(null, null);
          });
      } else {
        const users = data.fans_list || data.follow_list;
        users.forEach((_user) => {
          const user = _user;
          user._id = user.fans_uk || user.follow_uk;
          user.uk = user._id;
          user.uname = user.fans_uname || user.follow_uname;
          delete user.fans_uk;
          delete user.follow_uk;
          delete user.fans_uname;
          delete user.follow_uname;
        });
        if (users.length == 0) {
          this.save(page, 6)
            .done(() => {
              callback(null, null);
            });
        } else {
          pool.acquire((err, db) => {
            if (err) {
              pool.release(db);
              deferred.reject(`connection to mongodb ${err}`);
            } else {
              db.collection('user').insertMany(users, { ordered: false }, (err, res) => {
                console.log(`insert ${res.insertedCount} from ${users.length} users`);
                pool.release(db);

                const utask = [];
                const stask = [];
                users.forEach((user) => {
                  if (user.fans_count > 0) {
                    const url = `http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=${user.uk}&limit=20&start=0`;
                    utask.push({ type: 'fan', uid: md5(url), url, down: 0, done: 0 });
                  }
                  if (user.follow_count > 0) {
                    const url = `http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=${user.uk}&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1`;
                    utask.push({ type: 'follow', uid: md5(url), url, down: 0, done: 0 });
                  }
                  if (user.pubshare_count > 0) {
                    const url = `https://pan.baidu.com/wap/share/home?uk=${user.uk}&start=0`;
                    stask.push({ type: 'share', uid: md5(url), url, down: 0, done: 0 });
                  }
                });

                const { start, uk } = this.parse(page.url);
                const count = data.total_count;
                if ((start + 20) < count) {
                  const url = this.getUrl(page, uk, start + 20);
                  utask.push({ type: page.type, uid: md5(url), url, down: 0, done: 0 });
                }

                this.addTasks(utask, User)
                  .then(() => {
                    const res = this.addTasks(stask, Share);
                    return res;
                  })
                  .then(() => {
                    const res = this.save(page, 6);
                    return res;
                  })
                  .done(() => {
                    callback(null, null);
                  });
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

  getUrl(page, uk, start) {
    let res = '';
    if (page.type == 'fan') {
      res = `http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=${uk}&limit=20&start=${start}`;
    } else {
      res = `http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=${uk}&limit=20&start=${start}&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1`;
    }
    return res;
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
