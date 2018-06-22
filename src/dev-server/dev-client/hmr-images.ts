import { updateCssUrlValue, updateHmrHref } from './hmr-util';


export function hmrImages(win: Window, elm: Element, versionId: string, imageFileNames: string[]) {
  if (elm.nodeName.toLowerCase() === 'img') {
    imageFileNames.forEach(imageFileName => {
      hmrImgElement(elm as HTMLImageElement, versionId, imageFileName);
    });
  }

  const computedStyles = win.getComputedStyle(elm);
  IMAGE_PROPS.forEach(cssPropName => {
    hmrComputedUrl(elm, versionId, imageFileNames, computedStyles, cssPropName);
  });

  if (elm.shadowRoot) {
    hmrImages(win, elm.shadowRoot as any, versionId, imageFileNames);
  }

  if (elm.children) {
    for (let i = 0; i < elm.children.length; i++) {
      hmrImages(win, elm.children[i], versionId, imageFileNames);
    }
  }
}


const IMAGE_PROPS = ['backgroundImage', 'borderImage', 'webkitBorderImage', 'webkitMaskBoxImage'];


function hmrImgElement(imgElm: HTMLImageElement, versionId: string, imageFileName: string) {
  imgElm.src = updateHmrHref(versionId, imageFileName, imgElm.src);
}


function hmrComputedUrl(elm: Element, versionId: string, imageFileNames: string[], computedStyles: any, cssPropName: string) {
  const cssVal = computedStyles[cssPropName];

  if (cssVal.indexOf('url(') > -1) {
    imageFileNames.forEach(imageFileName => {
      hmrUpdateComputedUrl(elm, versionId, imageFileName, cssPropName, cssVal);
    });
  }
}


function hmrUpdateComputedUrl(elm: Element, versionId: string, imageFileName: string, jsPropName: string, oldCssVal: string) {
  const newCssVal = updateCssUrlValue(versionId, imageFileName, oldCssVal);

  if (newCssVal !== oldCssVal) {
    (elm as any).style[jsPropName] = newCssVal;
  }
}
