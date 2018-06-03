import * as d from '../declarations';
import { DEV_SERVER_URL, getContentType, isHtmlFile, isInitialDevServerLoad, isSimpleText, shouldCompress } from './util';
import { injectDevServerScripts } from './inject-scripts';
import { serve404, serve500 } from './serve-error';
import * as http  from 'http';
import * as path from 'path';
import * as zlib from 'zlib';
import { Buffer } from 'buffer';


export async function serveFile(devServerConfig: d.DevServerConfig, fs: d.FileSystem, req: d.HttpRequest, res: http.ServerResponse) {
  try {
    if (isSimpleText(req.filePath)) {
      // easy text file, use the internal cache
      let content = await fs.readFile(req.filePath);

      if (isHtmlFile(req.filePath)) {
        // auto inject our dev server script
        content += injectDevServerScripts(devServerConfig);
      }

      const contentLength = Buffer.byteLength(content, 'utf8');

      if (shouldCompress(devServerConfig, req, contentLength)) {
        // let's gzip this well known web dev text file
        res.writeHead(200, {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Expires': '0',
          'Content-Type': getContentType(devServerConfig, req.filePath)
        });
        zlib.createGzip().pipe(res);

      } else {
        // let's not gzip this file
        res.writeHead(200, {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Expires': '0',
          'Content-Type': getContentType(devServerConfig, req.filePath),
          'Content-Length': contentLength
        });
        res.write(content);
        res.end();
      }

    } else {
      // non-well-known text file or other file, probably best we use a stream
      // but don't bother trying to gzip this file for the dev server
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(devServerConfig, req.filePath),
        'Content-Length': req.stats.size
      });
      fs.createReadStream(req.filePath).pipe(res);
    }

  } catch (e) {
    serve500(res, e);
  }
}


export async function serveStaticDevClient(devServerConfig: d.DevServerConfig, fs: d.FileSystem, req: d.HttpRequest, res: http.ServerResponse) {
  try {
    if (isInitialDevServerLoad(req.pathname)) {
      req.filePath = path.join(devServerConfig.devServerDir, 'templates', 'initial-load.html');

    } else {
      const staticFile = req.pathname.replace(DEV_SERVER_URL + '/', '');
      req.filePath = path.join(devServerConfig.devServerDir, 'static', staticFile);
    }

    try {
      req.stats = await fs.stat(req.filePath);
      return serveFile(devServerConfig, fs, req, res);
    } catch (e) {
      return serve404(devServerConfig, fs, req, res);
    }

  } catch (e) {
    return serve500(res, e);
  }
}
