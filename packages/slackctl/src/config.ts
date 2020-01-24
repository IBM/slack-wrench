import { Array, Literal, Partial, Record, Static, String } from 'runtypes';

const Config = Record({
  version: Literal('v1.0'),
  id: String,
  baseUrl: String,
  sessionToken: String,
}).And(
  Partial({
    events: Record({
      requestPath: String,
    }).And(
      Partial({
        botEvents: Array(String),
        workspaceEvents: Array(String),
        unfurlDomains: Array(String),
      }),
    ),
  }),
);

export default Config;

export type Config = Static<typeof Config>;
