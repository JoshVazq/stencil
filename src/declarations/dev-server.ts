import * as d from './index';


export interface DevServerConfig {
  address?: string;
  contentTypes?: { [ext: string]: string };
  devServerDir?: string;
  gzip?: boolean;
  historyApiFallback?: HistoryApiFallback;
  hotReplacement?: boolean;
  openBrowser?: boolean;
  openUrl?: string;
  port?: number;
  protocol?: 'http' | 'https';
  root?: string;
}


export interface DevServerClientContext {
  hasClientInitialized?: boolean;
  isInitialDevServerLoad?: boolean;
}


export interface DevClientWindow extends Window {
  MozWebSocket: new (socketUrl: string, protos: string[]) => DevClientSocket;
  WebSocket: new (socketUrl: string, protos: string[]) => DevClientSocket;
}


export interface HistoryApiFallback {
  index?: string;
  disableDotRule?: boolean;
}


export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  acceptHeader: string;
  url: string;
  pathname?: string;
  filePath?: string;
  stats?: d.FsStats;
  headers?: {[name: string]: string};
}


export interface DevClientSocket {
  onopen: () => void;
  onerror: (event: { message: string; }) => void;
  onmessage: (event: { data: string; }) => void;
  onclose: (event: { code: number; reason: string; }) => void;
  protocol: number;
  send: (msg: string) => void;
}


export interface DevServerSocketConstructor {
  isWebSocket: (req: any) => boolean;
  new (request: any, socket: any, body: any, protos: string[]): DevServerSocket;
}


export interface DevServerSocket {
  on: (type: string, cb: (event: { data: string; }) => void) => void;
  send: (msg: string) => void;
}


export interface DevServerMessage {
  startServer?: DevServerConfig;
  serverStated?: DevServerConfig;
  buildResults?: d.BuildResults;
  requestBuildResults?: boolean;
  error?: { message?: string; type?: string; stack?: any; };
}
