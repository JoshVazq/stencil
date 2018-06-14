import * as d from '../../declarations';
import { appUpdate } from './app-update';


export function initClientWebSocket(ctx: d.DevServerClientContext, win: d.DevClientWindow, doc: Document) {
  try {
    const ClientWebSocket = win.WebSocket;
    const protos = ['xmpp'];

    // have the browser open a web socket with the server
    const socketUrl = `${win.location.protocol === 'https:' ? `wss:` : `ws:`}//${win.location.hostname}:${win.location.port}/`;
    const browserWs = new ClientWebSocket(socketUrl, protos);

    browserWs.onopen = () => {
      // the browser has opened a web socket with the server
      browserWebSocketOpened(browserWs);
    };

    browserWs.onmessage = (event) => {
      // the browser's web socket received a message from the server
      browserReceivedMessageFromServer(ctx, win, doc, JSON.parse(event.data));
    };

    browserWs.onerror = (event) => {
      // the browser's web socket has an error
      console.error(`dev server web socket error: ${event.message}`);
    };

    browserWs.onclose = (event) => {
      // the browser's web socket has closed
      console.log(`dev server web socket closed: ${event.code} ${event.reason}`);
    };

  } catch (e) {
    console.error('web socket error: ' + e);
  }
}


function browserWebSocketOpened(browserWs: d.DevClientSocket) {
  // now that we've got a good web socket connection opened
  // let's request the latest build results if they exist
  // if a build is still happening that's fine
  const msg: d.DevServerMessage = {
    requestBuildResults: true
  };
  browserWs.send(JSON.stringify(msg));
}


function browserReceivedMessageFromServer(ctx: d.DevServerClientContext, win: d.DevClientWindow, doc: Document, msg: d.DevServerMessage) {
  console.log('browserReceivedMessageFromServer', msg);

  if (msg.buildResults) {
    appUpdate(ctx, win, doc, msg.buildResults);
  }
}
