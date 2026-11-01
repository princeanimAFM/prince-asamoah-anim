/**
 * Plays a video's stage.html in Chromium in time with its voice-over segments and records it.
 * Usage: node tools/record.mjs videos/<name>   (after tools/tts.py has written build/segments.json)
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH ?? "/opt/node-tools/node_modules/playwright");
const dir = path.resolve(process.argv[2]);
const build = `${dir}/build`;
const segs = JSON.parse(fs.readFileSync(`${build}/segments.json`, "utf8"));
const scenes = (await import(pathToFileURL(`${dir}/scenes.mjs`).href)).default;
const GAP = 0.35;
// A tiny corner marker changes colour at each segment start, so sync.py can find it in the recording.
const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#ff8000", "#8000ff"];

const rawDir = `${build}/raw-${Date.now()}`;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1,
  recordVideo: { dir: rawDir, size: { width: 1080, height: 1920 } },
});
const page = await context.newPage();
await page.goto(pathToFileURL(`${dir}/stage.html`).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const js = (code) => page.evaluate(code);
const wait = (s) => page.waitForTimeout(Math.max(0, s * 1000));
const timeline = [];
const t0 = Date.now();
const now = () => (Date.now() - t0) / 1000;

async function segment(id, run) {
  const s = segs.find((x) => x.id === id);
  if (!s) throw new Error(`No segment "${id}" in segments.json`);
  const color = COLORS[timeline.length];
  timeline.push({ id, start: now(), color });
  await js(`mark('${color}')`);
  if (s.cap) await js(`caption(${JSON.stringify(s.cap)})`);
  const started = now();
  await run(s.dur);
  await wait(s.dur + GAP - (now() - started));
}

await scenes({ segment, js, wait });
await wait(0.6);
const total = now();
await context.close();
await browser.close();
const raw = fs.readdirSync(rawDir).filter((f) => f.endsWith(".webm")).map((f) => `${rawDir}/${f}`)[0];
fs.writeFileSync(`${build}/timeline.json`, JSON.stringify({ raw, total, timeline }, null, 1));
console.log(`recorded ${total.toFixed(1)}s`);
