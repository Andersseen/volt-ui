#!/usr/bin/env node

/** Entry point of `npx @voltui/mcp`. The installer itself lives in installer.js. */

'use strict';

require('./installer')
  .run(process.argv.slice(2))
  .then(code => process.exit(code));
