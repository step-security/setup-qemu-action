import {buildSync} from 'esbuild';

buildSync({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  sourcemap: true,
  minify: true,
  banner: {
    js: 'const __importMetaUrl = require("url").pathToFileURL(__filename).href;'
  },
  define: {
    'import.meta.url': '__importMetaUrl'
  }
});
