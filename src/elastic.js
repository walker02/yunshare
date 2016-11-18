import ElasticWorker from './worker/ElasticWorker';

const worker = new ElasticWorker();
worker.start('share');
