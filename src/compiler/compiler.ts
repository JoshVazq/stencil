import * as d from '../declarations';
import { build } from './build/build';
import { catchError } from './util';
import { docs } from './docs/docs';
import { getCompilerCtx } from './build/compiler-ctx';
import { getBrowserUrl } from '../dev-server/util';
import { startDevServerProcess } from '../dev-server/start-process';
import { validateConfig } from '../compiler/config/validate-config';


export class Compiler {
  protected ctx: d.CompilerCtx;
  isValid: boolean;
  config: d.Config;

  constructor(rawConfig: d.Config) {
    [ this.isValid, this.config ] = isValid(rawConfig);

    if (this.isValid) {
      this.ctx = getCompilerCtx(this.config);

      let startupMsg = `${this.config.sys.compiler.name} v${this.config.sys.compiler.version} `;
      if (this.config.sys.platform !== 'win32') {
        startupMsg += `💎`;
      }

      this.config.logger.info(this.config.logger.cyan(startupMsg));
      this.config.logger.debug(`compiler runtime: ${this.config.sys.compiler.runtime}`);

      if (this.config.flags.serve) {
        this.startDevServer();
      }
    }
  }

  async startDevServer() {
    if (this.config.sys.name !== 'node') {
      throw new Error(`Dev Server only availabe in node`);
    }

    const devServerConfig = await startDevServerProcess(this.config, this.ctx);
    return {
      browserUrl: getBrowserUrl(devServerConfig)
    };
  }

  build() {
    return build(this.config, this.ctx);
  }

  on(eventName: 'build', cb: (buildResults: d.BuildResults) => void): Function;
  on(eventName: 'rebuild', cb: (buildResults: d.BuildResults) => void): Function;
  on(eventName: any, cb: any) {
    return this.ctx.events.subscribe(eventName, cb);
  }

  once(eventName: 'build'): Promise<d.BuildResults>;
  once(eventName: 'rebuild'): Promise<d.BuildResults>;
  once(eventName: d.CompilerEventName) {
    return new Promise<any>(resolve => {
      const off = this.ctx.events.subscribe(eventName as any, (...args: any[]) => {
        off();
        resolve.apply(this, args);
      });
    });
  }

  off(eventName: string, cb: Function) {
    this.ctx.events.unsubscribe(eventName, cb);
  }

  trigger(eventName: 'fileUpdate', path: string): void;
  trigger(eventName: 'fileAdd', path: string): void;
  trigger(eventName: 'fileDelete', path: string): void;
  trigger(eventName: 'dirAdd', path: string): void;
  trigger(eventName: 'dirDelete', path: string): void;
  trigger(eventName: d.CompilerEventName, ...args: any[]) {
    args.unshift(eventName);
    this.ctx.events.emit.apply(this.ctx.events, args);
  }

  docs() {
    return docs(this.config, this.ctx);
  }

  get fs(): d.InMemoryFileSystem {
    return this.ctx.fs;
  }

  get name() {
    return this.config.sys.compiler.name;
  }

  get version() {
    return this.config.sys.compiler.version;
  }

}

function isValid(config: d.Config): [ boolean, d.Config | null] {
  try {
    // validate the build config
    validateConfig(config, true);
    return [ true, config ];

  } catch (e) {
    if (config.logger) {
      const diagnostics: d.Diagnostic[] = [];
      catchError(diagnostics, e);
      config.logger.printDiagnostics(diagnostics);

    } else {
      console.error(e);
    }
    return [ false, null ];
  }
}
