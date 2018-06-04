import * as d from '../declarations';
import { dashToPascalCase } from '../util/helpers';
import { queueUpdate } from './update';


export function hotModuleReplacement(plt: d.PlatformApi, elm: d.HostElement) {
  const cmpMeta = plt.getComponentMeta(elm);
  if (cmpMeta && cmpMeta.hmrUrl) {
    const url = cmpMeta.hmrUrl + '?hmr=' + (Date.now().toString().substring(6));

    __import(url).then(importedModule => {
      // replace the constructor with the new one
      cmpMeta.componentConstructor = importedModule[dashToPascalCase(cmpMeta.tagNameMeta)];

      // forget old instance
      const instance = plt.instanceMap.get(elm);
      if (instance) {
        plt.hostElementMap.delete(instance);
        plt.instanceMap.delete(elm);
      }

      queueUpdate(plt, elm);
    });
  }
}

declare var __import: (url: string) => Promise<d.ImportedModule>;
