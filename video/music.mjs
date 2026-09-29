// Writes a quiet ambient pad (no samples, nothing to license) as a WAV.
// Usage: node music.mjs <out.wav> <seconds> <ffmpeg.exe>
// Four chords are rendered once (6.5 s each) and then layered every 4 s.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [out, secondsArg, ffmpeg] = process.argv.slice(2);
const seconds = Number(secondsArg || 140);
if (!out || !ffmpeg) throw new Error("usage: node music.mjs <out.wav> <seconds> <ffmpeg.exe>");
const run = (args) => { const r = spawnSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" }); if (r.status !== 0) throw new Error("ffmpeg failed"); };

// Fmaj7 – Cmaj9 – Am7 – G
const chords = [
  [87.31, 174.61, 220.0, 261.63, 329.63],
  [65.41, 196.0, 246.94, 293.66, 329.63],
  [110.0, 164.81, 196.0, 261.63, 329.63],
  [98.0, 146.83, 196.0, 246.94, 293.66],
];
const STEP = 4, LEN = 6.5;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pad-"));

chords.forEach((c, i) => {
  const ch = (detune) => c.map((f, j) => `${j === 0 ? 0.55 : 0.32}*sin(2*PI*${(f + (j === 0 ? 0 : detune)).toFixed(2)}*t)`).join("+");
  const env = `pow(sin(PI*t/${LEN}),1.6)`;
  run(["-f", "lavfi", "-i", `aevalsrc=exprs='0.2*${env}*(${ch(-0.12)})|0.2*${env}*(${ch(0.12)})':s=44100:d=${LEN}`, path.join(tmp, `c${i}.wav`)]);
});

const n = Math.ceil(seconds / STEP) + 1;
const inputs = [], labels = [];
for (let k = 0; k < n; k++) {
  inputs.push("-i", path.join(tmp, `c${k % chords.length}.wav`));
  const ms = k * STEP * 1000;
  labels.push(`[${k}]adelay=${ms}|${ms}[a${k}]`);
}
const mix = `${labels.join(";")};${Array.from({ length: n }, (_, k) => `[a${k}]`).join("")}amix=inputs=${n}:normalize=0:duration=longest,atrim=0:${seconds},lowpass=f=1600,aecho=0.8:0.6:180|360:0.22|0.12,afade=t=in:d=3[out]`;
run([...inputs, "-filter_complex", mix, "-map", "[out]", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log("wrote", out);
