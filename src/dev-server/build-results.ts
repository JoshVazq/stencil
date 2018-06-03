import * as d from '../declarations';


export function generateBuildResults(buildResults: d.BuildResults) {
  const devServerBuild: d.DevServerBuildResults = {
    buildId: buildResults.buildId,
    diagnostics: buildResults.diagnostics,
    hasError: buildResults.hasError,
    hasSuccessfulBuild: buildResults.hasSuccessfulBuild,
    aborted: buildResults.aborted,
    duration: buildResults.duration,
    isRebuild: buildResults.isRebuild,
    dirsAdded: buildResults.dirsAdded,
    dirsDeleted: buildResults.dirsDeleted,
    filesChanged: buildResults.filesChanged,
    filesWritten: buildResults.filesWritten,
    stylesUpdated: buildResults.stylesUpdated
  };

  return devServerBuild;
}
