import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'screenshots');

const port = process.env.PORT || 3456;
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/#/login`, { waitUntil: 'networkidle' });
await page.waitForSelector('.auth__hero-title');
await mkdir(outDir, { recursive: true });
await page.screenshot({ path: path.join(outDir, 'login-spa.png'), fullPage: true });

await browser.close();
console.log('Screenshots saved to screenshots/');
