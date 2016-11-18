import Q from 'q';
import md5 from 'md5';
import { User, Share } from '../models';

const hots = require('../../data/hot.json');

const list = hots.hotuser_list;

function init() {
  const deferred = Q.defer();
  const uarr = [];
  const sarr = [];
  list.forEach((user) => {
    if (user.fans_count > 0) {
      const url = `http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=${user.hot_uk}&limit=20&start=0`;
      uarr.push({ type: 'fan', uid: md5(url), url, down: 0, done: 0 });
    }
    if (user.follow_count > 0) {
      const url = `http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=${user.hot_uk}&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1`;
      uarr.push({ type: 'follow', uid: md5(url), url, down: 0, done: 0 });
    }
    if (user.pubshare_count > 0) {
      const url = `https://pan.baidu.com/wap/share/home?uk=${user.hot_uk}&start=0`;
      sarr.push({ type: 'share', uid: md5(url), url, down: 0, done: 0 });
    }
  });
  User.bulkCreate(uarr)
    .then(() => Share.bulkCreate(sarr))
    .done(() => {
      deferred.resolve();
    });
  return deferred.promise;
}

Q(0)
  .then(() => User.sync({}))
  .then(() => Share.sync())
  .then(() => init())
  .done(() => process.exit(0));
