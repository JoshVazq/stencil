import * as d from '../declarations';


export async function startDevServer(config: d.Config, compiler: any) {
  config.devServer = config.devServer || {};
  config.devServer.startDevServer = true;

  if (typeof config.devServer.openBrowser !== 'boolean') {
    config.devServer.openBrowser = false;
  }

  const clientConfig: d.DevServerClientConfig = await compiler.startDevServer();
  config.logger.info(`dev server: ${clientConfig.browserUrl}`);

  process.once('SIGINT', () => {
    process.exit(0);
  });
}
