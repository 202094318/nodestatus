import Koa from 'koa';
import serve from 'koa-static';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import { resolve } from 'path';
import { logger } from './lib/utils';
import { createStatus } from './lib/status';
import config from './lib/config';
import db from './lib/db';

(async () => {
  await db.sync({ alter: true });
  const app = new Koa();

  app.use(historyApiFallback({
    whiteList: ['/admin/static', '/telegraf'],
    rewrites: [
      { from: /^\/admin/ as any, to: '/admin/index.html' }
    ]
  }));
  app.use(serve(resolve(__dirname, '../dist'), { maxage: 2592000 }));

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${ config.port }`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${ config.ipcAddress }`));
})();

