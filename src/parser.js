import Q from 'q';
import UserParser from './parser/UserParser';
import ShareParser from './parser/ShareParser';

const userparser = new UserParser();
const shareparser = new ShareParser();

function start() {
  Q(0)
    .then(() => shareparser.start())
    .then(() => userparser.start())
    .done(() => {
      console.log(`${new Date().toLocaleString()} parser worker wait for 1200s to start again`);
      setTimeout(() => { start(); }, 1200000);
    });
}

start();
