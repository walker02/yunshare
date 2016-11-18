import fs from 'fs-extra';
import path from 'path';
import req from 'request';
import md5 from 'md5';
import Q from 'q';

const root = (process.platform == 'win32') ? 'd:/data' : `${process.env.HOME}/data`;

const request = req.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36',
    Referer: 'https://yun.baidu.com/share/home?uk=23432432#category/type=0'
  },
  timeout: 30000
});

function getfile(url) {
  const name = md5(url);
  const str1 = name.substring(0, 2);
  const str2 = name.substring(2, 4);
  return path.join(root, str1, str2, `${name}`);
}

function exist(url) {
  try {
    fs.statSync(getfile(url));
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
}

function write(url, con) {
  const file = getfile(url);
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, con);
}

function read(url) {
  const file = getfile(url);
  return fs.readFileSync(file);
}

function fetch(url) {
  console.log(`down ${url} started`);
  const deferred = Q.defer();
  const file = getfile(url);
  fs.ensureDirSync(path.dirname(file));
  const stream = request
    .get(url)
    .on('error', (err) => {
      deferred.reject(`down ${url}:${err}`);
    })
    .on('response', (res) => {
      if (res.statusCode !== 200) {
        deferred.reject(`down ${url}:${res.statusCode}`);
      } else {
        console.log(`down ${url}:${res.statusCode}`);
      }
    })
    .pipe(fs.createWriteStream(`${file}`));

  stream.on('finish', () => {
    deferred.resolve();
  });
  return deferred.promise;
}

export { fetch, getfile, read, write, exist };
