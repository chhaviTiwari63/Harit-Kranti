const concurrently = require('concurrently');
const path = require('path');

const rootDir = __dirname;

concurrently([
  {
    command: 'node -e "require(\'ts-node\').register(); require(\'./src/server.ts\')"',
    name: 'backend',
    cwd: path.join(rootDir, 'backend'),
    prefixColor: 'green',
  },
  {
    command: 'node node_modules/vite/bin/vite.js --host',
    name: 'frontend',
    cwd: path.join(rootDir, 'harit-path-main'),
    prefixColor: 'cyan',
  },
], {
  prefix: 'name',
  killOthersOn: 'failure',
}).result.then(
  () => console.log('All processes exited successfully'),
  () => console.error('One or more processes failed')
);
