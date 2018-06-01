import * as d from '../declarations';
import { createRequestHandler } from './request-handler';
import { getSSL } from './ssl';
import * as http from 'http';
import * as https from 'https';


export async function createHttpServer(devServerConfig: d.DevServerConfig, fs: d.FileSystem) {
  const reqHandler = createRequestHandler(devServerConfig, fs);

  let server: http.Server;

  if (devServerConfig.ssl) {
    server = https.createServer(await getSSL(), reqHandler) as any;

  } else {
    server = http.createServer(reqHandler);
  }

  async function close() {
    await new Promise((resolve, reject) => {
      server.close((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  process.once('SIGINT', async () => {
    await close();
    process.exit(0);
  });

  return server;
}
