import md5 from 'md5';
import { User, Task } from '../models';

const hots = require('../../data/hot.json');

const list = hots.hotuser_list;

list.forEach((item) => {
  const user = { uk: item.hot_uk, name: item.hot_uname, avatar: item.avatar_url, intro: item.intro, type: item.user_type, vip: item.is_vip, fans: item.fans_count, follows: item.follow_count, shares: item.pubshare_count, albums: item.album_count };
  User.create(user)
    .then(() => {
      const arr = [];
      if (user.fans > 0) {
        const url = `http://yun.baidu.com/pcloud/friend/getfanslist?query_uk=${user.uk}&limit=20&start=0`;
        arr.push({ type: 'fan', uid: md5(url), url, down: 0, done: 0 });
      }
      if (user.follows > 0) {
        const url = `http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=${user.uk}&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1`;
        arr.push({ type: 'follow', uid: md5(url), url, down: 0, done: 0 });
      }
      if (user.shares > 0) {
        const url = `https://pan.baidu.com/wap/share/home?uk=${user.uk}&start=0`;
        arr.push({ type: 'share', uid: md5(url), url, down: 0, done: 0 });
      }
      Task.bulkCreate(arr);
    });
});
