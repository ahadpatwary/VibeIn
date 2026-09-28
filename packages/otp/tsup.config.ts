import { defineConfig } from 'tsup';

import packageJson from './package.json';

export default defineConfig({
   entry: ['src/index.ts'],
   format: ['cjs', 'esm'],
   dts: true,
   /**
    * bundle e rabbitmq include korbe na, runtime e node_modules theke resolve hobe
    */
   external: [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
   ],
   sourcemap: true,
   clean: true,
   minify: false,
   splitting: false,
   treeshake: true,
   target: 'es2020',
});
