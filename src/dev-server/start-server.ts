import * as d from '../declarations';
import { createHttpServer } from './server-http';
import { createWebSocketServer } from './server-web-socket';
import { findClosestOpenPort } from './find-closest-port';
import { getClientSideConfig } from './util';


export async function startDevServer(devServerConfig: d.DevServerConfig, fs: d.FileSystem) {
  try {
    devServerConfig.port = await findClosestOpenPort(devServerConfig.address, devServerConfig.port);

    const server = await createHttpServer(devServerConfig, fs);

    createWebSocketServer(server);

    server.listen(devServerConfig.port, devServerConfig.address);

    const msg: d.DevServerMessage = {
      startServerResponse: getClientSideConfig(devServerConfig)
    };

    process.send(msg);

  } catch (e) {
    console.error(e);
  }
}
