import * as d from '../declarations';
import { serve404, serve500 } from './serve-error';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';


export async function serveDirectoryIndex(devServerConfig: d.DevServerConfig, fs: d.FileSystem, req: d.HttpRequest, res: http.ServerResponse) {
  try {
    const indexFilePath = path.join(req.filePath, 'index.html');

    req.stats = await fs.stat(indexFilePath);
    if (req.stats.isFile()) {
      req.filePath = indexFilePath;
      return serveFile(devServerConfig, fs, req, res);
    }

  } catch (e) {}

  if (!req.pathname.endsWith('/')) {
    res.writeHead(302, {
      'location': req.pathname + '/'
    });
    return res.end();
  }

  try {
    const dirItemNames = await fs.readdir(req.filePath);

    try {
      const items = await getDirectoryItems(fs, req, dirItemNames);
      const dirTemplatePath = path.join(devServerConfig.devServerDir, 'templates', 'directory-index.html');
      const dirTemplate = await fs.readFile(dirTemplatePath);

      const fileHtml = items
        .map(item => {
          return (
            `<div class="dir-item">
              <div class="icon-${item.isDirectory ? 'directory' : 'file'}"></div>
              <div>
                <a class="link-${item.isDirectory ? 'directory' : 'file'}"
                  href="${item.pathname}">${item.name}</a>
              </div>
            </div>`
          );
        })
        .join('\n');

      const templateHtml = dirTemplate
        .replace('{directory}', req.pathname)
        .replace('{files}', fileHtml)
        .replace('{linked-path}', req.pathname.replace(/\//g, ' / '));

      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': 'text/html'
      });
      res.write(templateHtml);
      res.end();

    } catch (e) {
      serve500(res, e);
    }

  } catch (e) {
    serve404(devServerConfig, fs, req, res);
  }
}


async function getDirectoryItems(fs: d.FileSystem, req: d.HttpRequest, dirItemNames: string[]) {
  return Promise.all(dirItemNames.map(async dirItemName => {
    const absPath = path.join(req.filePath, dirItemName);

    const stats = await fs.stat(absPath);

    const item: DirectoryItem = {
      absPath: absPath,
      name: dirItemName,
      pathname: url.resolve(req.pathname, dirItemName),
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size
    };
    return item;
  }));
}


interface DirectoryItem {
  absPath: string;
  name: string;
  pathname: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
}
