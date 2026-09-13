import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  external: ['ioredis'], // bundle e ioredis include korbe na, runtime e node_modules theke resolve hobe
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  treeshake: true,
  target: "es2020",
});