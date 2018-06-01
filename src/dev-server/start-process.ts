import * as d from '../declarations';
import { generateBuildResults } from './build-results';


/**
 * NODE ONLY!
 * NOTE! this method is still apart of the main bundle
 * it is not apart of the dev-server/index.js bundle
 */

export function startDevServerProcess(config: d.Config, compilerCtx: d.CompilerCtx): Promise<d.DevServerClientConfig> {
  return new Promise(resolve => {
    const path = require('path');
    const fork = require('child_process').fork;

    // using the path stuff below because after the the bundles are created
    // then these files are no longer relative to how they are in the src directory
    config.devServer.devServerDir = path.join(__dirname, '..', 'dev-server');

    // get the path of the dev server module
    const program = require.resolve(path.join(config.devServer.devServerDir, 'index.js'));

    const parameters: string[] = [];
    const options = {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    };

    // start a new child process of the CLI process
    // for the http and web socket server
    const serverProcess = fork(program, parameters, options);

    serverProcess.stdout.on('data', (data: any) => {
      // the child server process has console logged data
      config.logger.debug(`dev server: ${data}`);
    });

    serverProcess.stderr.on('data', (data: any) => {
      // the child server process has console logged an error
      config.logger.error(`dev server error: ${data}`);
      serverProcess.kill();
    });

    serverProcess.on('message', (msg: d.DevServerMessage) => {
      // the CLI has received a message from the child server process
      cliReceivedMessageFromServer(config, compilerCtx, serverProcess, msg, resolve);
    });

    compilerCtx.events.subscribe('build', (buildResults) => {
      // a compiler build has finished
      const msg: d.DevServerMessage = {
        buildResults: generateBuildResults(buildResults)
      };

      // send the build results to the child server process
      serverProcess.send(msg);
    });

    // have the CLI is send a message to the child server process
    // to start the http and web socket server
    const msg: d.DevServerMessage = {
      startServerRequest: config.devServer
    };
    serverProcess.send(msg);
  });
}


function cliReceivedMessageFromServer(config: d.Config, compilerCtx: d.CompilerCtx, serverProcess: any, msg: d.DevServerMessage, resolve: Function) {
  if (msg.startServerResponse) {
    // received a message from the child process that the server has successfully started
    config.devServer.ssl = msg.startServerResponse.ssl;
    config.devServer.address = msg.startServerResponse.address;
    config.devServer.port = msg.startServerResponse.port;
    config.devServer.browserUrl = msg.startServerResponse.browserUrl;

    if (config.devServer.openBrowser) {
      config.sys.open(msg.startServerResponse.openUrl);
    }

    // resolve that everything is good to go
    resolve(msg.startServerResponse);
    return;
  }

  if (msg.requestBuildResults) {
    // we received a request to send up the latest build results
    if (compilerCtx.lastBuildResults) {
      // we do have build results, so let's send them to the child process
      const msg: d.DevServerMessage = {
        buildResults: compilerCtx.lastBuildResults
      };
      serverProcess.send(msg);
    }
    return;
  }
}

