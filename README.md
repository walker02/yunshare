# 百度云分享爬虫项目

github上有好几个这样的开源项目，但是都只提供了爬虫部分，这个项目在爬虫的基础上还增加了保存数据，建立elasticsearch索引的模块，可以用在实际生产环境中，不过web模块还是需要自己开发

## 安装

安装node.js和pm2，node用来运行爬虫程序和索引程序，pm2用来管理node任务

安装mysql和mongodb，mysql用来保存爬虫数据，mongodb用来保存最终的百度云分享数据，这些数据是json格式的，用mongodb保存更方便。

```
git clone https://github.com/callmelanmao/yunshare
cnpm i
```

推荐使用cnpm命令安装npm依赖，最简单的安装方式

```
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
```

更多安装cnpm的命令可以去[npm.taobao.org](http://npm.taobao.org/)上面找。


## 初始化

爬虫数据（主要是url列表）都是保存在mysql数据库的，yunshare使用sequelizejs做orm映射，源文件在`src/models/index.js`，默认的mysql用户名和密码都是root，数据看是yun，你需要手动创建yun数据库

```
create database yun default charset utf8
```

密码根据自己需要进行修改，完成mysql配置之后就可以运行下面的命令

```
gulp babel
node dist/init.js
```

注意必须先运行`gulp babel`把es6代码编译成es5，然后运行初始化脚本导入初始数据，数据文件在`data/hot.json`，里面，是从页面 http://yun.baidu.com/pcloud/friend/gethotuserlist?type=1&from=feed&start=0&limit=24&bdstoken=ac95ef31d3979f6ee707ef75cee9f5c5&clienttype=0&web=1 保存下来的。

## 启动项目

yunshare使用pm2进行nodejs进程管理，运行`pm2 start process.json`启动所有的后台任务，检查任务是否正常运行可以用命令`pm2 list`，正常运行的应该有4个任务。

## 启动elasticsearch索引

elasticsearch索引程序也已经写好了，mapping文件在`data/mapping.json`，请确保你已经安装elasticsearch 5.0的版本之后才运行索引程序，命令`pm2 start dist/elastic.js`。

默认的elasticsearch地址是http://localhost:9200，如果你需要修改这个地址，可以在`src/ElasticWorker.js`里面修改，修改任何js源码之后记得运行`gulp babel`，在重启pm2任务，不然修改是不会生效的。

在完成elasticsearch配置之后，你也可以在process.json里面添加一项elastic任务，这样就不需要单独启动索引程序了。

## DEMO

[网盘搜索](https://biliworld.com)
