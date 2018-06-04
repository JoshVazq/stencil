import * as d from '../../declarations';


export function genereateHotReload(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx) {
  if (!compilerCtx.isRebuild || !config.devServer || !config.devServer.hotReload) {
    return null;
  }

  const hotReload: d.HotReloadData = {};

  if (buildCtx.hasChangedJsText) {
    hotReload.windowReload = true;
    return hotReload;
  }

  if (buildCtx.stylesUpdated) {
    hotReload.stylesUpdated = Object.assign({}, buildCtx.stylesUpdated);
  }

  const externalStylesUpdated = getExternalStylesUpdated(config, compilerCtx, buildCtx);
  if (externalStylesUpdated) {
    hotReload.externalStylesUpdated = getExternalStylesUpdated(config, compilerCtx, buildCtx);
  }

  return hotReload;
}


function getExternalStylesUpdated(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx) {
  if (!compilerCtx.isRebuild) {
    return null;
  }

  const outputTargets = (config.outputTargets as d.OutputTargetWww[]).filter(o => o.type === 'www');
  if (outputTargets.length === 0) {
    return null;
  }

  const cssFiles = buildCtx.filesWritten.filter(f => f.endsWith('.css'));
  if (cssFiles.length === 0) {
    return null;
  }

  const updatedCssFiles: string[] = [];

  cssFiles.forEach(fileWritten => {
    outputTargets.forEach(outputTarget => {
      updatedCssFiles.push('/' + config.sys.path.relative(outputTarget.dir, fileWritten));
    });
  });

  return updatedCssFiles.sort();
}
