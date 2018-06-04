import  * as d from '../../declarations';


export function appHotReload(doc: Document, buildResults: d.BuildResults) {

  if (buildResults.externalStylesUpdated) {
    hotReloadExternalStyles(doc, buildResults.externalStylesUpdated);
  }

  if (buildResults.stylesUpdated) {
    hotReloadStyles(doc, buildResults.stylesUpdated);
  }
}


function hotReloadExternalStyles(doc: Document, updatedUrls: string[]) {
  const versionId = Date.now().toString().substring(5) + (Math.round(Math.random() * 899) + 100);

  const styleSheets = doc.querySelectorAll('link[rel="stylesheet"][href]') as NodeListOf<HTMLLinkElement>;
  for (let i = 0; i < styleSheets.length; i++) {
    for (let j = 0; j < updatedUrls.length; j++) {
      hotReloadExternalStyle(versionId, styleSheets[i], updatedUrls[j]);
    }
  }
}

export function hotReloadExternalStyle(versionId: string, styleSheet: HTMLLinkElement, updatedUrl: string) {
  if (!styleSheet || !styleSheet.href || !updatedUrl) {
    return;
  }

  const stylesheetPaths = styleSheet.href.split('/');
  const stylesheetUrl = stylesheetPaths[stylesheetPaths.length - 1];
  const stylesheetSplt = stylesheetUrl.split('?');

  let updatedFilename = updatedUrl.split('/').pop();

  const stylesheetFilename = stylesheetSplt[0];

  if (stylesheetFilename !== updatedFilename) {
    return;
  }

  const stylesheetQs = stylesheetSplt[1];
  const qs: {[key: string]: string} = {};
  if (stylesheetQs) {
    stylesheetQs.split('&').forEach(kv => {
      const splt = kv.split('=');
      qs[splt[0]] = splt[1] ? splt[1] : '';
    });
  }

  qs['s-v'] = versionId;

  updatedFilename += '?' + Object.keys(qs).map(key => {
    return key + '=' + qs[key];
  }).join('&');

  stylesheetPaths[stylesheetPaths.length - 1] = updatedFilename;

  styleSheet.href = stylesheetPaths.join('/');
}


function hotReloadStyles(doc: Document, stylesUpdated: { [styleId: string]: string}) {
  Object.keys(stylesUpdated).forEach(styleId => {
    const styleText = stylesUpdated[styleId];
    hostReloadStyle(doc.documentElement, styleId, styleText);
  });
}


function hostReloadStyle(elm: Element, styleId: string, styleText: string) {
  if (elm.getAttribute && elm.getAttribute('data-style-id') === styleId) {
    elm.innerHTML = styleText;
  }

  if (elm.shadowRoot) {
    hostReloadStyle(elm.shadowRoot as any, styleId, styleText);
  }

  if ((elm as HTMLTemplateElement).content) {
    hostReloadStyle((elm as HTMLTemplateElement).content as any, styleId, styleText);
  }

  if (elm.children) {
    for (let i = 0; i < elm.children.length; i++) {
      hostReloadStyle(elm.children[i], styleId, styleText);
    }
  }
}
