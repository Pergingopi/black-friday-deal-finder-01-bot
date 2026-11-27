// shots.mjs — render this repo's 4 screenshots in headless Chromium
// (Playwright-core + the cached Chromium build). Serves app/ on a local
// port, opens each shot from shots.json, waits for window.__shotReady,
// and saves a JPEG. Reports console errors, page errors and any
// non-local request.
// Usage: node shots.mjs <repo> <shots-json> <out-dir>
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/node_modules/playwright-core');

const [repo, shotsFile, outDir] = process.argv.slice(2);
if (!repo || !shotsFile || !outDir) {
  throw new Error('usage: node shots.mjs <repo> <shots-json> <out-dir>');
}
const shots = JSON.parse(readFileSync(shotsFile, 'utf8'));
mkdirSync(outDir, { recursive: true });

const PORT = 8139;
const server = spawn(
  'node',
  ['serve.ts', '--port', String(PORT)],
  { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] },
);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('server did not start')), 15000);
  server.stdout.on('data', () => {
    clearTimeout(timer);
    resolve();
  });
  server.stderr.on('data', (d) => process.stderr.write(d));
});

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu'],
});
const errors = [];
const externalRequests = [];
try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`${shot.name} console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`${shot.name} pageerror: ${err.message}`));
    page.on('request', (req) => {
      const url = req.url();
      if (!url.startsWith(`http://127.0.0.1:${PORT}`) && !url.startsWith(`http://localhost:${PORT}`)) {
        externalRequests.push(`${shot.name}: ${url}`);
      }
    });
    const url = `http://127.0.0.1:${PORT}/index.html${shot.query}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 20000 });
    const out = join(outDir, shot.name);
    await page.screenshot({ path: out, type: 'jpeg', quality: 85 });
    const state = await page.evaluate(() => ({
      title: document.title,
      cards: document.querySelectorAll('.card').length,
      detail: !!document.querySelector('.detail'),
      count: document.querySelector('#count')?.textContent ?? '',
    }));
    const size = statSync(out).size;
    console.log(JSON.stringify({ shot: shot.name, url, bytes: size, state }));
    await page.close();
  }
} finally {
  await browser.close();
  server.kill('SIGKILL');
}
console.log(JSON.stringify({ errors, externalRequests }));
if (errors.length > 0 || externalRequests.length > 0) process.exit(1);
