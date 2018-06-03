import  * as d from '../../declarations';


export function appHotReload(win: d.DevClientWindow, doc: Document, buildResults: d.DevServerBuildResults) {
  win;

  if (buildResults.stylesUpdated) {
    hotReloadStyles(doc, buildResults.stylesUpdated);
  }
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
