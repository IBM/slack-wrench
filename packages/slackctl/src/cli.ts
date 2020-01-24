#!/usr/bin/env node

import yargs from 'yargs';

import apply from './commands/apply';

// eslint-disable-next-line no-unused-expressions
yargs.command(apply).argv;
