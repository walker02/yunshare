'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fetch = require('../util/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var url = 'http://storebt.com/down/BcEJEQAwCAMwSy3POuwMDv8SlrAtOisx8gXzyMdWl8wOGXgesBUf/btkitty.so_Horse-sex-Cicciolina-mpg.torrent';
var page = {
  url: url,
  uid: (0, _md2.default)(url),
  down: 0,
  done: 0,
  set: function set() {}
};

(0, _fetch2.default)(page).then(function (con) {
  _fsExtra2.default.writeFile('/f/torrent/test.torrent', con);
}).done(function () {
  console.log(page);
});