'use strict';

var _models = require('../models');

function getUser(list) {
  var arr = list.map(function (item) {
    var user = { uk: item.uk, avatar: item.avatar, intro: item.intro, type: item.type, vip: item.vip, fans: item.fans, follows: item.follows, shares: item.shares, albums: item.albums };
    return user;
  });
  return arr;
}

function getShare(list) {
  var arr = list.map(function (item) {
    var share = { uk: item.uk, type: item.type, category: item.category, public: item.public, shareid: item.shareid, data_id: item.data_id, title: item.title, third: item.third, name: item.name, avatar: item.avatar, ctime: item.ctime, desc: item.desc, filecount: item.filecount, filelist: item.filelist };
    return share;
  });
  return arr;
}

function getTask(list) {
  var arr = list.map(function (item) {
    var task = { uid: item.uid, type: item.type, url: item.url, down: item.down, done: item.done, ext: item.ext };
    return task;
  });
  return arr;
}

function copyUser(offset) {
  return _models.User.findAll({
    offset: offset,
    limit: 100,
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      return _models.User2.bulkCreate(getUser(list)).then(copyUser(offset + list.length));
    }
  });
}

function copyShare(offset) {
  return _models.Share.findAll({
    offset: offset,
    limit: 100,
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      return _models.Share2.bulkCreate(getShare(list)).then(copyShare(offset + list.length));
    }
  });
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

copyUser(0).done(function () {
  console.log('move user done');
});

copyShare(0).done(function () {
  console.log('move share done');
});

copyTask(0).done(function () {
  console.log('move task done');
});