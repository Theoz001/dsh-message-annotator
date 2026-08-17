/**
 * Offline build: bundles the plugin with whatever local esbuild can be found
 * (this machine keeps no global node toolchain). Override with
 * DSH_ESBUILD=/abs/path/to/node_modules/esbuild when the defaults miss.
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const candidates = [
  process.env.DSH_ESBUILD,
  join(here, 'node_modules', 'esbuild'),
  join(here, '..', 'codex-file-tree', 'node_modules', 'esbuild'),
  join(here, '..', 'muxy-ai-session-restore', 'node_modules', 'esbuild'),
  join(here, '..', '..', 'opensource', 'muxy-file-tree-extension', 'node_modules', 'esbuild'),
].filter(Boolean)
const home = candidates.find((p) => existsSync(join(p, 'lib', 'main.js')))
if (!home) throw new Error('esbuild not found; set DSH_ESBUILD to a node_modules/esbuild path')
const require = createRequire(join(here, 'noop.js'))
const esbuild = require(home)

const PKG = '@deepseek-ai/dsh-client-ui-annotator'
/** Runtime-provided modules: resolved by the web shell client module system. */
const external = ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/*', '@deepseek-ai/*']

const banner = [
  'window.__ModuleLoader__.load({',
  '\tid: ' + JSON.stringify(PKG) + ',',
  '\tfactory: (require) => {',
  '\t\tvar module = { exports: {} };',
  '\t\tvar exports = module.exports;',
].join('\n')
const footer = ['\t\treturn module.exports;', '\t}', '});'].join('\n')

/** Host-side ESM entries (loader plugin + invariant companion). */
await esbuild.build({
  entryPoints: [join(here, 'src', 'index.ts'), join(here, 'src', 'invariant.ts')],
  outdir: join(here, 'lib'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  external,
  logLevel: 'info',
})

/** Browser half: one lazy-CJS factory wrapped for window.__ModuleLoader__. */
await esbuild.build({
  entryPoints: [join(here, 'src', 'client', 'index.ts')],
  outfile: join(here, 'lib', 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'chrome130',
  jsx: 'automatic',
  sourcemap: true,
  external,
  banner: { js: banner },
  footer: { js: footer },
  logLevel: 'info',
})

console.log('built lib/index.js, lib/invariant.js, lib/client.js')
