#!/usr/bin/env node

import yargs from 'yargs';

import apply from './commands/apply';

// eslint-disable-next-line no-unused-expressions
yargs.command(
  'apply',
  'apply a Slack app configuration',
  command =>
    command
      .option('n', {
        alias: 'ngrok',
      })
      .option('t', {
        alias: 'timeout',
        default: 0,
      })
      .option('s', {
        alias: 'session-token',
        // default: '',
      }),
  argv => {
    console.log(argv);
    apply(argv).catch(console.error);
  },
).argv;
