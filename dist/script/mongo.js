'use strict';

var _mongodb = require('mongodb');

var _models = require('../models');

var url = 'mongodb://localhost:27017/yun';

function getUser(list) {
  var arr = list.map(function (item) {
    var user = { _id: item.uk, uk: item.uk, avatar: item.avatar, intro: item.intro, type: item.type, vip: item.vip, fans: item.fans, follows: item.follows, shares: item.shares, albums: item.albums };
    return user;
  });
  return arr;
}

function getShare(list) {
  var arr = list.map(function (item) {
    var share = { _id: item.data_id, uk: item.uk, type: item.type, category: item.category, public: item.public, shareid: item.shareid, data_id: item.data_id, title: item.title, third: item.third, name: item.name, avatar: item.avatar, ctime: item.ctime, desc: item.desc, filecount: item.filecount, filelist: JSON.parse(item.filelist) };
    return share;
  });
  return arr;
}

function copyUser(users, offset) {
  return _models.User.findAll({
    offset: offset,
    limit: 100,
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      users.insertMany(getUser(list), { ordered: false }, function (err, res) {
        console.log('insert ' + res.insertedCount + ' users');
        copyUser(users, offset + list.length);
      });
    }
  });
}

function copyShare(shares, offset) {
  return _models.Share.findAll({
    offset: offset,
    limit: 100,
    order: [['id', 'ASC']]
  }).then(function (list) {
    if (list.length > 0) {
      shares.insertMany(getShare(list), { ordered: false }, function (err, res) {
        console.log('insert ' + res.insertedCount + ' shares');
        copyShare(shares, offset + list.length);
      });
    }
  });
}

_mongodb.MongoClient.connect(url, function (err, db) {
  var users = db.collection('user');
  copyUser(users, 0).done(function () {
    console.log('move user done');
  });
  var shares = db.collection('share');
  copyShare(shares, 0).done(function () {
    console.log('move share done');
  });
});