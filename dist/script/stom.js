'use strict';

var _models = require('../models');

// move data from sqlite to mysql

function getTask(list) {
  var arr = list.map(function (item) {
    var task = { uid: item.uid, type: item.type, url: item.url, down: item.down, done: item.done, ext: item.ext };
    return task;
  });
  return arr;
}

function moveUser(offset) {
  return _models.Yun.findAll({
    offset: offset,
    limit: 100,
    where: {
      type: ['fan', 'follow']
    },
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      return _models.User.bulkCreate(getTask(list)).then(moveUser(offset + list.length));
    }
  });
}

function moveShare(offset) {
  return _models.Yun.findAll({
    offset: offset,
    limit: 100,
    where: {
      type: ['share']
    },
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      return _models.Share.bulkCreate(getTask(list)).then(moveShare(offset + list.length));
    }
  });
}

moveUser(0).done(function () {
  console.log('move user done');
});

moveShare(0).done(function () {
  console.log('move share done');
});