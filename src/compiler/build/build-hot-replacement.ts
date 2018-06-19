import * as d from '../../declarations';


export function genereateHotReplacement(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx) {
  if (!buildCtx.isRebuild || !config.devServer || !config.devServer.hotReplacement) {
    return null;
  }

  const hotReload: d.HotReplacement = {};

  const componentsUpdated = getComponentsUpdated(compilerCtx, buildCtx);
  if (componentsUpdated) {
    hotReload.componentsUpdated = componentsUpdated;
  }

  if (Object.keys(buildCtx.stylesUpdated).length > 0) {
    hotReload.stylesUpdated = Object.assign({}, buildCtx.stylesUpdated);
  }

  const externalStylesUpdated = getExternalStylesUpdated(config, buildCtx);
  if (externalStylesUpdated) {
    hotReload.externalStylesUpdated = getExternalStylesUpdated(config, buildCtx);
  }

  if (Object.keys(hotReload).length === 0) {
    return null;
  }

  return hotReload;
}


function getComponentsUpdated(compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx) {
  // find all of the components that would be affected from the file changes
  if (!buildCtx.filesChanged) {
    return null;
  }

  const changedScriptFiles = buildCtx.filesChanged.filter(f => {
    return f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js');
  });

  if (changedScriptFiles.length === 0) {
    return null;
  }

  const componentsUpdated: string[] = [];
  const allModuleFiles = Object.keys(compilerCtx.moduleFiles).map(tsFilePath => compilerCtx.moduleFiles[tsFilePath]);

  changedScriptFiles.forEach(changedScriptFile => {
    addComponentsUpdated(allModuleFiles, componentsUpdated, changedScriptFile);
  });

  if (componentsUpdated.length === 0) {
    return null;
  }

  return componentsUpdated.sort();
}


function addComponentsUpdated(allModuleFiles: d.ModuleFile[], componentsUpdated: string[], changedScriptFile: string) {
  allModuleFiles.forEach(moduleFile => {
    if (moduleFile.cmpMeta) {
      const checkedFiles: string[] = [];
      const shouldAdd = addComponentUpdated(allModuleFiles, componentsUpdated, changedScriptFile, checkedFiles, moduleFile);

      if (shouldAdd && !componentsUpdated.includes(moduleFile.cmpMeta.tagNameMeta)) {
        componentsUpdated.push(moduleFile.cmpMeta.tagNameMeta);
      }
    }
  });
}


function addComponentUpdated(allModuleFiles: d.ModuleFile[], componentsUpdated: string[], changedScriptFile: string, checkedFiles: string[], moduleFile: d.ModuleFile): boolean {
  if (checkedFiles.includes(changedScriptFile)) {
    return false;
  }
  checkedFiles.push(changedScriptFile);

  if (moduleFile.sourceFilePath === changedScriptFile) {
    return true;
  }

  if (moduleFile.jsFilePath === changedScriptFile) {
    return true;
  }

  return moduleFile.localImports.some(localImport => {
    const localImportModuleFile = allModuleFiles.find(m => m.sourceFilePath === localImport);
    if (localImportModuleFile) {
      return addComponentUpdated(allModuleFiles, componentsUpdated, changedScriptFile, checkedFiles, localImportModuleFile);
    }
    return false;
  });
}


function getExternalStylesUpdated(config: d.Config, buildCtx: d.BuildCtx) {
  if (!buildCtx.isRebuild) {
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
