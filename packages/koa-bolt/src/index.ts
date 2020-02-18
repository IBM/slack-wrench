import Router, { RouterParamContext } from '@koa/router';
import { ExpressReceiver } from '@slack/bolt';
import { Middleware, ParameterizedContext } from 'koa';
import compose from 'koa-compose';

const defaultEndpoints = {
  events: '/slack/events',
};

export interface KoaBoltOptions {
  receiver: ExpressReceiver;
  endpoints?: Record<string, string>;
}

export default function koaBolt({
  receiver,
  endpoints = defaultEndpoints,
}: KoaBoltOptions): Middleware<
  ParameterizedContext<any, RouterParamContext>,
  ParameterizedContext<any, RouterParamContext>
> {
  const boltRouter = new Router();

  const boltMiddleware: Middleware = ctx => {
    delete ctx.res.statusCode;
    ctx.respond = false;

    receiver.app(ctx.req, ctx.res);
  };

  Object.values(endpoints).forEach(endpoint =>
    boltRouter.post(endpoint, boltMiddleware),
  );

  return compose([boltRouter.routes(), boltRouter.allowedMethods()]);
}
