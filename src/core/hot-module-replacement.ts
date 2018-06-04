import * as d from '../declarations';


export function hotModuleReplacement(plt: d.PlatformApi, elm: d.HostElement) {
  const cmpMeta = plt.getComponentMeta(elm);
  if (cmpMeta) {
    console.log('hmr', cmpMeta.tagNameMeta);
  }
}
