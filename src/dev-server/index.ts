import * as d from '../declarations';
import { NodeFs } from '../sys/node/node-fs';
import { startDevServer } from './start-server';
import * as path from 'path';


async function startServerRequest(devServerConfig: d.DevServerConfig) {
  try {
    const fs = new NodeFs();
    devServerConfig.contentTypes = await loadContentTypes(fs);
    startDevServer(devServerConfig, fs);

  } catch (e) {
    console.error('dev server error', e);
  }
}


async function loadContentTypes(fs: NodeFs) {
  const contentTypePath = path.join(__dirname, 'content-type-db.json');
  const contentTypeJson = await fs.readFile(contentTypePath);
  return JSON.parse(contentTypeJson);
}


process.on('message', (msg: d.DevServerMessage) => {
  if (msg.startServerRequest) {
    startServerRequest(msg.startServerRequest);
  }
});


process.on('unhandledRejection', (error: Error) => {
  console.log('dev server, unhandledRejection', error.message);
});
