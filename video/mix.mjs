// Mixes a voice track and the music pad from music.mjs into a silent video.
// Usage: node mix.mjs <video.mp4> <voice.wav> <out.mp4> <ffmpeg.exe> [seconds]
// pad.wav must be at least as long as the video (node music.mjs pad.wav <seconds> <ffmpeg.exe>).
// The pad ducks under the voice (sidechain) and comes back between lines; the mix is normalised to -16 LUFS.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [video, voice, out, ffmpeg, seconds] = process.argv.slice(2);
if (!video || !voice || !out || !ffmpeg) throw new Error("usage: node mix.mjs <video.mp4> <voice.wav> <out.mp4> <ffmpeg.exe> [seconds]");
const here = path.dirname(fileURLToPath(import.meta.url));

const filter = [
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.7[pad]",
  "[2:a]aresample=48000,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aformat=channel_layouts=stereo,asplit=2[v][key]",
  "[pad][key]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[bed]",
  "[bed][v]amix=inputs=2:normalize=0:duration=shortest,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]",
].join(";");

const r = spawnSync(ffmpeg, [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", video,
  "-i", path.join(here, "pad.wav"),
  "-i", voice,
  "-filter_complex", filter,
  "-map", "0:v", "-map", "[a]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
  ...(seconds ? ["-t", seconds] : ["-shortest"]),
  "-movflags", "+faststart",
  out,
], { stdio: "inherit" });
if (r.status !== 0) throw new Error("ffmpeg failed");
console.log("wrote", out);
