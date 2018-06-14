import * as d from '../../declarations';
import { initClient } from './init-client';
import { isInitialDevServerLoad } from '../util';


const ctx: d.DevServerClientContext = {
  isInitialDevServerLoad: isInitialDevServerLoad(window.location.pathname)
};

initClient(ctx, window.parent as any, window.parent.document);
