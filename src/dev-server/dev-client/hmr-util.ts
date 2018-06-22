

export function updateHmrHref(versionId: string, fileName: string, oldHref: string) {
  if (typeof oldHref !== 'string') {
    return oldHref;
  }

  const hrefParts = oldHref.split('/');
  let hrefFileName = hrefParts[hrefParts.length - 1];

  const hrefSplt = hrefFileName.split('?');
  hrefFileName = hrefSplt[0];

  if (fileName !== hrefFileName) {
    // only compare by filename, not full path
    return oldHref;
  }

  const oldQs = hrefSplt[1];
  const newQs: {[key: string]: string} = {};
  if (oldQs) {
    oldQs.split('&').forEach(kv => {
      const splt = kv.split('=');
      newQs[splt[0]] = splt[1] ? splt[1] : '';
    });
  }

  newQs['s-hmr'] = versionId;

  return oldHref.split('?')[0] + '?' + Object.keys(newQs).map(key => {
    return key + '=' + newQs[key];
  }).join('&');
}


export function updateCssUrlValue(versionId: string, fileName: string, oldCss: string) {
  const reg = /url\((['"]?)(.*)\1\)/ig;
  let result;
  let newCss = oldCss;

  while ((result = reg.exec(oldCss)) !== null) {
    const url = result[2];
    newCss = newCss.replace(
      url,
      updateHmrHref(versionId, fileName, url)
    );
  }

  return newCss;
}
