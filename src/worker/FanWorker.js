import async from 'async';
import Q from 'q';
import sleep from 'sleep-time';
import { fetch } from '../util/fetch';
import { User } from '../models';

export default class FanWorker {

  start() {
    User.findAll({
      limit: 100,
      where: {
        type: 'fan',
        down: 0,
        done: 0,
      },
      order: [
        ['id', 'ASC'],
      ]
    }).then((list) => {
      if (list.length > 0) {
        this.begin(list);
      } else {
        console.log(`${new Date().toLocaleString()} fan worker wait for 1200s to start again`);
        setTimeout(() => { this.start(); }, 1200000);
      }
    });
  }

  limit(time = 5000) {
    sleep(time);
  }

  begin(list) {
    const deferred = Q.defer();
    async.mapLimit(list, 1, (_page, callback) => {
      const page = _page;
      fetch(page.url)
        .then(() => {
          this.limit();
          page.set('down', 6);
          return page.save();
        })
        .catch((err) => {
          console.log(`${err}`);
        })
        .done(() => {
          callback(null, null);
        });
    }, () => {
      deferred.resolve(this.start());
    });
    return deferred.promise;
  }
}
