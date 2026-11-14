import { buildSync } from 'esbuild';
import { fileURLToPath } from 'node:url';

const entry = fileURLToPath(new URL('../src/scripts/theme.ts', import.meta.url));
const core = fileURLToPath(new URL('../src/lib/theme.ts', import.meta.url));
const moduleId = 'virtual:portfolio-theme-bootstrap';
const resolvedId = `\0${moduleId}`;

// Bundle the same typed policy/effect entry used by tests; do not duplicate it in HTML.
export function buildThemeBootstrap() {
  return buildSync({
    entryPoints: [entry], bundle: true, write: false, format: 'iife',
    platform: 'browser', target: 'es2020', minify: true,
  }).outputFiles[0].text;
}

export function themeBootstrapPlugin() {
  return {
    name: 'portfolio-theme-bootstrap',
    resolveId(id) { if (id === moduleId) return resolvedId; },
    load(id) {
      if (id !== resolvedId) return;
      this.addWatchFile(entry);
      this.addWatchFile(core);
      return `export default ${JSON.stringify(buildThemeBootstrap())};`;
    },
    handleHotUpdate({ file, server }) {
      if (file !== entry && file !== core) return;
      const module = server.moduleGraph.getModuleById(resolvedId);
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
