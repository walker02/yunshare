'use strict';

var _fetch = require('../util/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var url = 'https://pan.baidu.com/wap/share/home?uk=2567856934&start=0';
var page = {
  url: url,
  down: 0,
  done: 0,
  set: function set() {}
};

(0, _fetch2.default)(page).then(function (con) {
  console.log(con);
});