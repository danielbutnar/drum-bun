// Turns a take from film.mjs into an MP4, and with a voice folder also into a voice track and captions.
// Usage: node build.mjs <takeDir> <out.mp4> <ffmpeg.exe> [voiceDir]
// Frames keep their real timing, except inside markers: "cut" segments vanish,
// "speed" segments are squeezed to `target` seconds (page loads, AI waits, card entry).
// With voiceDir (voice.py output), every "say" marker starts its line; where a squeezed wait left a line
// too little picture, the frame on screen is held. The page (1920x900) gets a caption band below it;
// writes <takeDir>/voice.wav for mix.mjs and <out>.srt for uploads.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [take, out, ffmpeg, voiceDir] = process.argv.slice(2);
if (!take || !out || !ffmpeg) throw new Error("usage: node build.mjs <takeDir> <out.mp4> <ffmpeg.exe> [voiceDir]");
const PAUSE = 0.3; // shortest gap between two voice lines
const TAIL = 1.2; // picture after the last line
const PAGE_H = 900, BAND_H = 180; // 1920 wide
const frames = JSON.parse(fs.readFileSync(path.join(take, "frames.json"), "utf8"));
const all = JSON.parse(fs.readFileSync(path.join(take, "markers.json"), "utf8"));
const markers = all
  .filter((m) => m.end > m.start)
  .sort((a, b) => a.start - b.start);
const says = all.filter((m) => m.type === "say").sort((a, b) => a.t - b.t);

// drop overlapping markers (keep the earlier one)
const clean = [];
for (const m of markers) if (!clean.length || m.start >= clean[clean.length - 1].end) clean.push(m);

const t0 = frames[0].t;
function mapT(t) {
  let out = t - t0;
  for (const m of clean) {
    if (t <= m.start) break;
    const inside = Math.min(t, m.end) - m.start;
    const factor = m.type === "cut" ? 0 : m.target / (m.end - m.start);
    out -= inside * (1 - factor);
  }
  return out;
}

const seq = []; // { file, t, d }
for (let i = 0; i < frames.length; i++) {
  const d = i + 1 < frames.length ? mapT(frames[i + 1].t) - mapT(frames[i].t) : 1.5;
  if (d <= 0.001) continue;
  seq.push({ file: frames[i].file, t: frames[i].t, d });
}

const placed = []; // { id, text, start, dur } in output seconds
if (voiceDir) {
  const spoken = JSON.parse(fs.readFileSync(path.join(voiceDir, "lines.json"), "utf8"));
  const starts = [0];
  for (const f of seq) starts.push(starts[starts.length - 1] + f.d);
  let held = 0;
  for (const s of says) {
    let i = 0; // the frame on screen when the line starts
    while (i + 1 < seq.length && seq[i + 1].t <= s.t) i++;
    let start = starts[i] + Math.max(0, mapT(s.t) - mapT(seq[i].t)) + held;
    const prev = placed[placed.length - 1];
    const need = prev ? prev.start + prev.dur + PAUSE - start : 0;
    if (need > 0) { seq[i].d += need; held += need; start += need; }
    placed.push({ id: s.id, text: s.text, start, dur: spoken[s.id] });
  }
  const last = placed[placed.length - 1];
  const total = starts[seq.length] + held;
  const want = last.start + last.dur + TAIL;
  if (total < want) seq[seq.length - 1].d += want - total;
  fs.writeFileSync(path.join(take, "timeline.json"), JSON.stringify(placed, null, 1));
  console.log(`voice lines ${placed.length}, frames held for ${held.toFixed(1)} s`);
}

const lines = [];
let total = 0;
for (const f of seq) {
  lines.push(`file 'frames/${f.file}'`, `duration ${f.d.toFixed(4)}`);
  total += f.d;
}
lines.push(`file 'frames/${seq[seq.length - 1].file}'`); // concat demuxer needs the last file twice
fs.writeFileSync(path.join(take, "list.txt"), lines.join("\n"));
console.log(`frames ${frames.length}, markers ${clean.length}, video length ${total.toFixed(1)} s`);

// captions: shown from the line's start until the next line (or shortly after the line when a long gap follows);
// a line longer than two caption rows is split at sentence (or comma) ends, each part timed by its length
const MAX_CAP = 120;
function parts(text) {
  const pieces = text.split(/(?<=[.!?])\s+/).flatMap((s) => (s.length > MAX_CAP ? s.split(/(?<=[,:])\s+/) : [s]));
  const out = [];
  for (const s of pieces) {
    if (out.length && (out[out.length - 1] + " " + s).length <= MAX_CAP) out[out.length - 1] += " " + s;
    else out.push(s);
  }
  return out;
}
const caps = placed.flatMap((p, k) => {
  const next = placed[k + 1];
  const end = next ? Math.min(next.start, p.start + p.dur + 0.8) : total;
  const texts = parts(p.text);
  const chars = texts.reduce((n, s) => n + s.length, 0);
  let at = p.start;
  return texts.map((text, i) => {
    const from = at;
    at += (p.dur * text.length) / chars;
    return { text, start: from, end: i === texts.length - 1 ? end : at };
  });
});
const wrap = (s, n = 64) => s.split(" ").reduce((rows, w) => { const last = rows[rows.length - 1]; if ((last + " " + w).trim().length > n) rows.push(w); else rows[rows.length - 1] = (last + " " + w).trim(); return rows; }, [""]).join("\n");
const draw = caps.map((c, k) => {
  fs.writeFileSync(path.join(take, `cap${k}.txt`), wrap(c.text));
  return `drawtext=fontfile=font.ttf:textfile=cap${k}.txt:expansion=none:fontsize=40:fontcolor=0x1B1A1F:line_spacing=12:x=(w-text_w)/2:y=${PAGE_H}+(${BAND_H}-text_h)/2:enable='between(t,${c.start.toFixed(2)},${c.end.toFixed(2)})'`;
});
if (caps.length) fs.copyFileSync("C:/Windows/Fonts/seguisb.ttf", path.join(take, "font.ttf"));

const run = (args) => { const r = spawnSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit", cwd: take }); if (r.status !== 0) throw new Error("ffmpeg failed"); };
run([
  "-f", "concat", "-safe", "0", "-i", "list.txt",
  "-vf", [
    "fps=30",
    `scale=1920:${PAGE_H}:force_original_aspect_ratio=decrease`,
    `pad=1920:${PAGE_H}:(ow-iw)/2:(oh-ih)/2:color=0xFBFBF9`,
    `pad=1920:${PAGE_H + BAND_H}:0:0:color=0xFBFBF9`,
    `drawbox=x=0:y=${PAGE_H}:w=1920:h=2:color=0x1B1A1F@0.15:t=fill`,
    ...draw,
    "format=yuv420p",
  ].join(","),
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-movflags", "+faststart",
  path.resolve(out),
]);
console.log("wrote", out);

if (voiceDir) {
  const inputs = placed.flatMap((p) => ["-i", path.resolve(voiceDir, `${p.id}.wav`)]);
  const delays = placed.map((p, k) => `[${k}]aresample=48000,adelay=${Math.round(p.start * 1000)}:all=1[v${k}]`);
  const mix = `${delays.join(";")};${placed.map((_, k) => `[v${k}]`).join("")}amix=inputs=${placed.length}:normalize=0:duration=longest,apad=whole_dur=${total.toFixed(3)},atrim=0:${total.toFixed(3)}[out]`;
  run([...inputs, "-filter_complex", mix, "-map", "[out]", "-ac", "1", "voice.wav"]);
  console.log("wrote", path.join(take, "voice.wav"));

  const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
  const srt = caps.map((c, k) => `${k + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${wrap(c.text, 48)}\n`).join("\n");
  fs.writeFileSync(out.replace(/\.mp4$/, ".srt"), srt);
  console.log("wrote", out.replace(/\.mp4$/, ".srt"));
}
