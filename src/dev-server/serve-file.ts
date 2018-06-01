import * as d from '../declarations';
import { DEV_SERVER_URL, getContentType, isHtmlFile, isInitialDevServerLoad } from './util';
import { injectDevServerScripts } from './inject-scripts';
import { serve404 } from './serve-error';
import * as http  from 'http';
import * as path from 'path';
import { Buffer } from 'buffer';


export async function serveFile(devServerConfig: d.DevServerConfig, fs: d.FileSystem, req: d.HttpRequest, res: http.ServerResponse) {
  try {
    if (isHtmlFile(req.filePath)) {
      // easy text file, use the internal cache
      let content = await fs.readFile(req.filePath);

      // auto inject our dev server script
      content += `${injectDevServerScripts(devServerConfig)}`;

      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(devServerConfig, req.filePath),
        'Content-Length': Buffer.byteLength(content, 'utf8')
      });

      res.write(content);
      res.end();

    } else {
      // non-well-known text file or other file, probably best we use a stream
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(devServerConfig, req.filePath),
        'Content-Length': req.stats.size
      });

      fs.createReadStream(req.filePath).pipe(res);
    }

  } catch (e) {
    return serve404(devServerConfig, fs, req, res);
  }
}


export async function serveStaticDevClient(config: d.DevServerConfig, fs: d.FileSystem, req: d.HttpRequest, res: http.ServerResponse) {
  try {
    if (isInitialDevServerLoad(req.pathname)) {
      req.filePath = path.join(config.devServerDir, 'templates', 'initial-load.html');

    } else {
      const staticFile = req.pathname.replace(DEV_SERVER_URL + '/', '');
      req.filePath = path.join(config.devServerDir, 'static', staticFile);
    }

    req.stats = await fs.stat(req.filePath);
    return serveFile(config, fs, req, res);

  } catch (e) {
    return serve404(config, fs, req, res);
  }
}
