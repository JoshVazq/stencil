import * as d from '../declarations';


export async function startTask(process: NodeJS.Process, sys: d.StencilSystem, logger: d.Logger) {
  try {
    const namespace = process.argv[3];

    const appDir = sys.path.join(process.cwd(), namespace);

    const configPath = sys.path.join(appDir, 'stencil.config.js');

    await sys.fs.writeFile(configPath, createConfig(namespace));

  } catch (e) {
    logger.error(e);
  }
}


function createConfig(namespace: string) {
  const c: string[] = [];

  c.push(``);
  c.push(`exports.config = {`);

  c.push(`  namespace: '${namespace}'`);

  c.push(`};`);
  c.push(``);

  return c.join('\n');
}
