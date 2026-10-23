import { chromium } from 'playwright';
import fs from 'fs';
fs.mkdirSync('shots', { recursive: true });
const base = 'http://localhost:4173/';
const day = (d) => { const t = new Date(); t.setDate(t.getDate() - d); return t; };
const iso = (d) => day(d).toISOString();
const ymd = (d) => day(d).toISOString().slice(0, 10);
const urine = (id, d) => ({ id, createdAt: iso(d), source: 'manual', type: 'urine', productId: 'urine-5', regionCount: 5, overall: 'normal',
  readings: ['glucose','ketones','blood','ph','protein'].map((p) => ({ paramId: p, levelIndex: 0, status: 'normal', confidence: 'manual' })) });
const opk = (id, d, ratio, category) => ({ id, createdAt: iso(d), source: 'manual', type: 'opk', productId: 'opk-standard', ratio, category });
const state = { version: 1, profile: { tracking: 'both', age: 21, lastPeriodDate: ymd(14), cycleLength: 28, periodLength: 5, goal: 'understandCycle' },
  consentAcceptedAt: iso(30), settings: { theme: 'light', locale: 'en', autoCapture: true, useTrainedModel: true, roboflowKey: '' },
  records: [urine('u1', 12), urine('u2', 6), urine('u3', 1),
    opk('o1', 6, 0.35, 'low'), opk('o2', 5, 0.5, 'low'), opk('o3', 4, 0.72, 'low'), opk('o4', 3, 0.86, 'rising'), opk('o5', 2, 1.08, 'peak'), opk('o6', 1, 0.6, 'low')],
  periodStarts: [ymd(42), ymd(14)] };
const b = await chromium.launch();
async function shot(name, hash, vp, seed) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, colorScheme: 'light' });
  if (seed) await ctx.addInitScript((s) => localStorage.setItem('lumenova.v1', JSON.stringify(s)), state);
  const p = await ctx.newPage();
  await p.goto(base + hash, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/${name}.png` });
  await p.screenshot({ path: `shots/${name}-full.png`, fullPage: true });
  await ctx.close();
}
await shot('home', '#/', { width: 1440, height: 900 }, false);
await shot('dashboard', '#/app', { width: 390, height: 844 }, true);
await shot('dashboard-wide', '#/app', { width: 1280, height: 800 }, true);
await shot('result', '#/app/result/u3', { width: 390, height: 844 }, true);
await shot('scan', '#/app/scan', { width: 390, height: 844 }, true);
await shot('calendar', '#/app/calendar', { width: 390, height: 844 }, true);
await b.close();
