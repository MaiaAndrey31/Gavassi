// Injeta o HTML pré-renderizado em dist/index.html e remove o bundle SSR temporário.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const file = path.join(root, 'dist', 'index.html');
const html = await fs.readFile(file, 'utf8');
await fs.writeFile(file, html.replace('<!--app-html-->', render()));
await fs.rm(ssrDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
console.log('✓ prerender → dist/index.html');
