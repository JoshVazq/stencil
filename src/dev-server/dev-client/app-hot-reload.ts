import  * as d from '../../declarations';


export function appHotReload(win: Window, doc: Document, hotReload: d.HotReloadData) {

  if (hotReload.windowReload) {
    win.location.reload(true);
    return;
  }

  if (hotReload.externalStylesUpdated) {
    reloadExternalStyles(doc, hotReload.externalStylesUpdated);
  }

  if (hotReload.stylesUpdated) {
    reloadStyles(doc, hotReload.stylesUpdated);
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
