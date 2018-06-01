import * as d from '../declarations';
import { DEV_SERVER_URL, getClientSideConfig } from './util';


export function injectDevServerScripts(devServerConfig: d.DevServerConfig) {
  const clientConfig = getClientSideConfig(devServerConfig);

  return '\n' + [
    `<script data-dev-server-script>`,
    `window['s-dev-server'] = ${JSON.stringify(clientConfig, null, 2)};`,
    `</script>`,
    `<script src="${DEV_SERVER_URL}/dev-server.js" data-dev-server-script></script>`
  ].join('\n');
}
