import * as d from '../../declarations';
import { appReset } from './app-update';
import { initClientWebSocket } from './client-web-socket';


export async function initClient(devServerConfig: d.DevServerClientConfig, ctx: d.DevServerClientContext, win: d.DevClientWindow, doc: Document) {
  try {
    if (!devServerConfig) {
      console.error(`invalid client-side dev server config`);
      return;
    }

    if (ctx.hasClientInitialized) {
      // somehow we've already initialized the dev server client-side script
      // don't bother doing it again (this shouldn't happen)
      return;
    }
    ctx.hasClientInitialized = true;

    if (ctx.isInitialDevServerLoad) {
      // this page is the initial dev server load page
      // we currently have an ugly url like /__dev_server_init
      // or something, let's quickly change that using
      // history.replaceState() and update the url to
      // what's expected like /
      // we're doing this so we can force the server
      // worker to unregister, but do not fully reload the page yet
      await appReset(win);
    }

    // let's setup this thing
    initClientWebSocket(ctx, win, doc);

  } catch (e) {
    console.error(e);
  }
}
