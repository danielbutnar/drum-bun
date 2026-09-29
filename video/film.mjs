// Films the Drum Bun demo from the live site, paced by the narration.
// Usage: node film.mjs <outDir> [--dry]
//   --dry: headless, no frames, no waiting for the voice (selector test).
// Needs voice/lines/lines.json from voice.py: say(id) marks where a line starts; the next say() waits
// until it has been spoken. build.mjs places the voice and the caption band. Helpers adapted from the
// Rope Street Tattoo take (lovable-challenge/video/film.mjs).
import { chromium } from "file:///C:/Users/danie/.claude/skills/web-qa/scripts/node_modules/playwright-core/index.mjs";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://drum-bun-khaki.vercel.app";
const OUT = process.argv[2];
const DRY = process.argv.includes("--dry");
if (!OUT) throw new Error("usage: node film.mjs <outDir> [--dry]");
fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });

const NARRATION = Object.fromEntries(JSON.parse(fs.readFileSync(new URL("./narration.json", import.meta.url), "utf8")).map((l) => [l.id, l.text]));
const SPOKEN = JSON.parse(fs.readFileSync(new URL("./voice/lines/lines.json", import.meta.url), "utf8"));
const PAUSE = 0.3;

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const now = () => Date.now() / 1000;
const markers = [];
const frames = [];

const browser = await chromium.launch({ channel: "chrome", headless: DRY, args: ["--window-position=0,0", "--lang=en-US"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 600 }, deviceScaleFactor: 1.5, locale: "en-US" });
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);

// ---------- screencast ----------
let cdp = null;
let casting = false;
async function startCast() {
  if (DRY) return;
  cdp = await ctx.newCDPSession(page);
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const name = String(frames.length).padStart(6, "0") + ".jpg";
    fs.writeFileSync(path.join(OUT, "frames", name), Buffer.from(data, "base64"));
    frames.push({ file: name, t: metadata.timestamp });
    try { await cdp.send("Page.screencastFrameAck", { sessionId }); } catch {}
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  casting = true;
}
async function stopCast() {
  if (!cdp || !casting) return;
  try { await cdp.send("Page.stopScreencast"); } catch {}
  try { await cdp.detach(); } catch {}
  casting = false;
}
async function recast() { if (DRY) return; await stopCast(); await startCast(); }

// ---------- overlay: cursor, click ring, cards ----------
let mx = 640, my = 300;
async function overlay() {
  await page.evaluate(({ mx, my }) => {
    if (document.getElementById("__rec")) return;
    const root = document.createElement("div");
    root.id = "__rec";
    root.innerHTML = `
      <div id="__cur" style="position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(${mx}px,${my}px)">
        <svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.5 15 L17 15 Z" fill="#1d2a33" stroke="#fbfcf9" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </div>
      <div id="__dot" style="position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:2px solid #c8372d;border-radius:50%;z-index:2147483646;pointer-events:none;opacity:0;transform:scale(.4)"></div>
      <div id="__card" style="position:fixed;inset:0;background:#eef1ea;color:#1d2a33;z-index:2147483645;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px;font-family:var(--font-archivo),system-ui,sans-serif"></div>`;
    document.documentElement.appendChild(root);
    document.addEventListener("mousemove", (e) => {
      document.getElementById("__cur").style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    }, true);
    document.addEventListener("mousedown", (e) => {
      const d = document.getElementById("__dot");
      d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
      d.animate([{ opacity: 0.9, transform: "scale(.4)" }, { opacity: 0, transform: "scale(1.4)" }], { duration: 450, easing: "ease-out" });
    }, true);
  }, { mx, my });
}
async function showCard(html) {
  await overlay();
  await page.evaluate((h) => { const c = document.getElementById("__card"); c.innerHTML = h; c.style.display = "flex"; document.getElementById("__cur").style.visibility = "hidden"; }, html);
}
async function hideCard() {
  await page.evaluate(() => { document.getElementById("__card").style.display = "none"; document.getElementById("__cur").style.visibility = "visible"; });
}

// ---------- narration ----------
let speakingUntil = 0;
async function done() {
  if (DRY) return;
  const left = speakingUntil - now();
  if (left > 0) await wait(left * 1000);
}
async function say(id) {
  if (!(id in SPOKEN)) throw new Error(`no voice line "${id}": run voice.py first`);
  await done();
  if (speakingUntil) await wait(PAUSE * 1000);
  markers.push({ type: "say", id, t: now(), text: NARRATION[id] });
  speakingUntil = now() + (DRY ? 0 : SPOKEN[id]);
  log(`say ${id} (${SPOKEN[id]} s)`);
}

// ---------- actions ----------
async function goto(p, ready) {
  const t0 = now();
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  if (ready) await ready.first().waitFor({ timeout: 30000 });
  await wait(500);
  await overlay();
  await recast();
  if (now() - t0 > 1.2) markers.push({ type: "speed", start: t0, end: now(), target: 0.6 });
}
// Smooth, visible scroll so the element's top sits `offset` px below the viewport top.
async function scrollTo(loc, offset = 90, steps = 36) {
  const b = await loc.first().boundingBox();
  const dy = b.y - offset;
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await wait(16); }
  await wait(300);
}
async function moveTo(loc) {
  const el = loc.first();
  const b = await el.boundingBox();
  const x = b.x + Math.min(b.width / 2, 260), y = b.y + Math.min(b.height / 2, 20);
  await page.mouse.move(x, y, { steps: 24 });
  mx = x; my = y;
  await wait(180);
}
async function click(loc) {
  await moveTo(loc);
  await page.mouse.down(); await wait(70); await page.mouse.up();
  await wait(250);
}
async function slow(fn, keep = 2) {
  const t0 = now();
  await fn();
  const t1 = now();
  if (t1 - t0 > keep + 0.5) markers.push({ type: "speed", start: t0 + 0.3, end: t1 - 0.2, target: Math.max(keep - 0.5, 0.6) });
}

const card = (inner) => `<div style="max-width:980px;display:flex;flex-direction:column;gap:22px;align-items:center">${inner}</div>`;

// ---------- the take ----------
log("setup");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await overlay();
await startCast();

log("scene 1: title and the problem");
await showCard(card(`<div style="font-weight:850;font-size:120px;letter-spacing:-3px;font-variation-settings:'wdth' 125">Drum bun!</div>
  <div style="font-size:30px;max-width:820px;line-height:1.3">What your car needs between Romania and Germany or Austria</div>`));
await say("hook");
await done();
await hideCard();
await say("mess");
await wait(2500);
await moveTo(page.getByText(/Romania replaced its rovinietă/));
await wait(1500);

log("scene 2: the trip");
await done();
await scrollTo(page.locator("form").first(), 70);
await moveTo(page.getByLabel("From"));
await say("meet");
await wait(1400);
await moveTo(page.getByLabel("Leaving"));
await wait(1200);
await moveTo(page.getByLabel(/Euro class/));
await wait(900);
await slow(async () => {
  await click(page.getByRole("button", { name: "Plan my trip" }));
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { name: /Brașov → Munich/ }).waitFor({ timeout: 30000 });
});
await overlay(); await recast();

log("scene 3: the plan");
await done();
await scrollTo(page.getByRole("heading", { name: /Brașov → Munich/ }), 60);
await say("plan");
await moveTo(page.locator("svg[role=img]"));
await page.mouse.move(mx + 380, my, { steps: 60 });
await wait(800);

log("scene 4: cheapest cover in Austria");
await done();
const austria = page.locator("li").filter({ has: page.getByRole("heading", { name: "Austria", exact: true }) });
await scrollTo(austria, 80);
await say("cheap");
await moveTo(austria.getByText(/Austrian 1-day vignette/).first());
await wait(1600);
await click(austria.locator("summary", { hasText: "Why this" }));
await wait(2500);
await moveTo(austria.getByText(/2 × Austrian 10-day/).first());

log("scene 5: Romania by Euro class");
await done();
const romania = page.locator("li").filter({ has: page.getByRole("heading", { name: "Romania", exact: true }) });
await moveTo(romania.getByText("Band: Euro IV–V").first());
await say("romania");
await wait(3000);
await moveTo(romania.getByText(/26 lei/).first());

log("scene 6: before you go");
await done();
await scrollTo(page.getByRole("heading", { name: "Before you go" }), 70);
await say("warn");
await moveTo(page.getByText(/alpine symbol in wintry conditions \(Germany\)\. Details/).first());
await wait(3500);
await moveTo(page.getByText(/Munich low-emission zone \(green sticker\): You need/).first());

log("scene 7: claims");
await done();
await scrollTo(page.getByRole("heading", { name: /You may have read/ }), 60);
await say("claims");
await moveTo(page.locator("ul li").filter({ hasText: /verdict|outdated|wrong|misleading/ }).first());
await wait(1200);

log("scene 8: the agent");
await done();
await scrollTo(page.getByRole("heading", { name: "Ask the agent" }), 60);
await click(page.getByRole("button", { name: /Plec din Cluj la Viena/ }));
await page.getByText(/Recorded answer from/).waitFor({ timeout: 5000 });
await say("agent");
await moveTo(page.locator(".prose-agent").first());
await wait(2500);

log("scene 9: the trace");
await done();
const trace = page.locator("details summary", { hasText: /step/ }).first();
await click(trace);
await say("trace");
await wait(1500);
await moveTo(page.getByText("Open the full plan").first());
await wait(1500);

log("scene 10: how it knows");
await done();
await goto("/knowledge", page.getByRole("heading", { name: "How it knows" }));
await say("kb");
await moveTo(page.getByRole("list", { name: "From sources to answer" }).locator("li").nth(2));
await wait(2000);

log("scene 11: issues and decisions");
await done();
await scrollTo(page.locator("#conflicts"), 50);
await say("issues");
await moveTo(page.getByText("not kept").first());
await wait(2200);
await moveTo(page.getByText("kept", { exact: true }).first());

log("scene 12: caught");
await done();
await scrollTo(page.locator("#instructions"), 50);
await say("caught");
await moveTo(page.getByText(/Romania's winter-tyre fine is class IV/).first());
await wait(1500);

log("scene 13: evals");
await done();
await showCard(card(`<div style="font-size:26px;color:#4a5a66">16 test questions in Romanian, German and English</div>
  <div style="display:flex;gap:64px;align-items:flex-end">
    <div><div style="font-weight:850;font-size:110px;font-variation-settings:'wdth' 125;color:#9e2a22">15</div><div style="font-size:24px">Drum Bun agent</div></div>
    <div><div style="font-weight:850;font-size:110px;font-variation-settings:'wdth' 125;color:#4a5a66">11</div><div style="font-size:24px">keyword search, same content</div></div>
  </div>
  <div style="font-size:20px;max-width:780px;line-height:1.4;color:#4a5a66">Search found the documents but could not price a Christmas trip, pick a Euro-class price, or cover the Hungarian M1 with county vignettes.</div>`));
await say("eval");

log("scene 14: end");
await done();
await showCard(card(`<div style="font-weight:850;font-size:110px;letter-spacing:-3px;font-variation-settings:'wdth' 125">Drum bun!</div>
  <div style="font-size:28px">drum-bun-khaki.vercel.app</div>
  <div style="font-size:20px;line-height:1.5;color:#4a5a66">Sanity project pd5e7gez · github.com/danielbutnar/drum-bun<br>Facts checked on 29 September 2026. Not legal advice.</div>`));
await say("end");
await done();
await wait(1500);

await stopCast();
fs.writeFileSync(path.join(OUT, "frames.json"), JSON.stringify(frames));
fs.writeFileSync(path.join(OUT, "markers.json"), JSON.stringify(markers, null, 1));
log(`DONE frames=${frames.length} markers=${markers.length}`);
await browser.close();
