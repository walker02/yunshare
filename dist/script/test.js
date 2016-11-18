'use strict';

//const url = 'http://yun.baidu.com/pcloud/friend/getfollowlist?query_uk=3645112425&limit=20&start=0&bdstoken=d82467db8b1f5741daf1d965d1509181&channel=chunlei&clienttype=0&web=1';

var url = 'https://pan.baidu.com/wap/share/home?uk=1112219283&start=0';

function parse(url) {
  var arr = url.split(/[?&]/);
  var start = 2147483647;
  var uk = '';
  arr.forEach(function (item) {
    if (item.startsWith('start')) {
      var tmp = item.split('=');
      if (tmp.length === 2) {
        start = parseInt(tmp[1], 10);
      }
    }
    if (item.startsWith('query_uk') || item.startsWith('uk')) {
      var _tmp = item.split('=');
      uk = _tmp[1];
    }
  });
  return { start: start, uk: uk };
}

console.log(parse(url));