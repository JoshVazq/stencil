import  * as d from '../../declarations';
import { appError, clearDevServerModal } from './app-error';
import { appHotReload } from './app-hot-reload';


export function appUpdate(ctx: d.DevServerClientContext, win: d.DevClientWindow, doc: Document, buildResults: d.BuildResults) {
  try {
    // remove any app errors that may already be showing
    clearDevServerModal(doc);

    if (buildResults.hasError) {
      // looks like we've got an error
      // let's show the error all pretty like
      appError(doc, buildResults);
      return;
    }

    if (ctx.isInitialDevServerLoad) {
      // this page is the initial dev server loading page
      // and build has finished without errors
      // let's make sure the url is at the root
      // and we're unregistered any existing service workers
      // then let's refresh the page from the root
      appReset(win).then(() => {
        win.location.reload(true);
      });
      return;
    }

    if (buildResults.isRebuild && buildResults.hasChangedJsText && buildResults.hasSuccessfulBuild) {
      // this is a successful rebuild and the changes were of JS text, so do a full reload


      win.location.reload(true);
      return;
    }

    // let's hot reload what we can from the build results
    appHotReload(doc, buildResults);

  } catch (e) {
    console.error(e);
  }
}


export function appReset(win: d.DevClientWindow) {
  // we're probably at some ugly url
  // let's update the url to be the expect root url: /
  win.history.replaceState({}, 'App', '/');

  if (!win.navigator.serviceWorker) {
    return Promise.resolve();
  }

  // it's possible a service worker is already registered
  // for this localhost url from some other app's development
  // let's ensure we entirely remove the service worker for this domain
  return win.navigator.serviceWorker.getRegistration().then(swRegistration => {
    if (swRegistration) {
      return swRegistration.unregister().then(hasUnregistered => {
        if (hasUnregistered) {
          console.log(`unregistered service worker`);
        }
      });
    }
    return Promise.resolve();
  });
}
