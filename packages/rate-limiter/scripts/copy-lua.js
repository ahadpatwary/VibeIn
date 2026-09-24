// scripts/copy-lua.js

import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('src/lua_scripts');
const destination = path.resolve('dist/lua');

fs.cpSync(source, destination, {
   recursive: true,
});

console.log('✓ Lua scripts copied');
