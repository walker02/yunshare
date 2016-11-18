'use strict';

var _models = require('../models');

function getTask(list) {
  var arr = list.map(function (item) {
    var task = { uid: item.uid, type: item.type, url: item.url, down: item.down, done: item.done, ext: item.ext };
    return task;
  });
  return arr;
}

function copyTask(offset) {
  return _models.Task.findAll({
    offset: offset,
    limit: 100,
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      return _models.Task2.bulkCreate(getTask(list)).then(copyTask(offset + list.length));
    }
  });
}

copyTask(0).done(function () {
  console.log('move task done');
});