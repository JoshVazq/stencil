import  * as d from '../../declarations';


export function appHotReplacement(win: d.DevClientWindow, doc: Document, hmr: d.HotReplacement) {
  if (hmr.windowReload) {
    win.location.reload(true);
    return;
  }

  if (hmr.componentsUpdated) {
    if (supportsDynamicImports()) {
      reloadComponents(doc, hmr.componentsUpdated);
    } else {
      win.location.reload(true);
      return;
    }
  }

  if (hmr.stylesUpdated) {
    reloadStyles(doc, hmr.stylesUpdated);
  }

  if (hmr.externalStylesUpdated) {
    reloadExternalStyles(doc, hmr.externalStylesUpdated);
  }
}


function reloadComponents(doc: Document, componentsUpdated: string[]) {
  componentsUpdated.forEach(tagName => {
    reloadComponent(doc.documentElement, tagName.toLowerCase());
  });
}


function reloadComponent(elm: Element, tagName: string) {
  // drill down through every node in the page
  // to include shadow roots and look for this
  // component tag to run hmr() on
  if (elm.nodeName.toLowerCase() === tagName) {
    (elm as any)['s-hmr'] && (elm as any)['s-hmr']();
  }

  if (elm.shadowRoot) {
    reloadComponent(elm.shadowRoot as any, tagName);
  }

  if (elm.children) {
    for (let i = 0; i < elm.children.length; i++) {
      reloadComponent(elm.children[i], tagName);
    }
  }
}


function reloadExternalStyles(doc: Document, updatedUrls: string[]) {
  const versionId = Date.now().toString().substring(5) + (Math.round(Math.random() * 899) + 100);

  const styleSheets = doc.querySelectorAll('link[rel="stylesheet"][href]') as NodeListOf<HTMLLinkElement>;
  for (let i = 0; i < styleSheets.length; i++) {
    for (let j = 0; j < updatedUrls.length; j++) {
      reloadExternalStyle(versionId, styleSheets[i], updatedUrls[j]);
    }
  }
}


export function reloadExternalStyle(versionId: string, styleSheet: HTMLLinkElement, updatedUrl: string) {
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


function reloadStyles(doc: Document, stylesUpdated: { [styleId: string]: string}) {
  Object.keys(stylesUpdated).forEach(styleId => {
    const styleText = stylesUpdated[styleId];
    reloadStyle(doc.documentElement, styleId, styleText);
  });
}


function reloadStyle(elm: Element, styleId: string, styleText: string) {
  if (elm.getAttribute && elm.getAttribute('data-style-id') === styleId) {
    elm.innerHTML = styleText;
  }

  if (elm.shadowRoot) {
    reloadStyle(elm.shadowRoot as any, styleId, styleText);
  }

  if ((elm as HTMLTemplateElement).content) {
    reloadStyle((elm as HTMLTemplateElement).content as any, styleId, styleText);
  }

  if (elm.children) {
    for (let i = 0; i < elm.children.length; i++) {
      reloadStyle(elm.children[i], styleId, styleText);
    }
  }
}

function supportsDynamicImports() {
  try {
    new Function('import("")');
    return true;
  } catch (e) {}
  return false;
}
