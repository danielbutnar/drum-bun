# Speaks every line of a narration file with Kokoro (open-weights TTS, Apache-2.0), one WAV per line.
# Usage: uv run --no-project --with kokoro-onnx --with soundfile python voice.py <models dir> <voice> <narration.json> <out dir> [id ...]
# Models: kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.1).
# Writes <out dir>/<id>.wav and <out dir>/lines.json ({id: seconds}); film.mjs waits for each line, build.mjs places them.
# Pass ids to redo only those lines (e.g. "weeks" once the take's numbers are known).
import json
import re
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

# Spoken spelling only; the captions keep the real words.
SAY = [
    (r"Brașov", "Brahshawv"),
    (r"Drum [Bb]un", "Droom Boon"),
    (r"M plus S", "M plus S"),
    (r"lei", "lay"),
    (r"Sanity", "Sanity"),
]
# No phoneme pins needed for these lines.
PHONEMES = []

models, voice, script, out = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4])
only = set(sys.argv[5:])
lang = "en-gb" if voice.startswith("b") else "en-us"
kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
lines = json.loads(script.read_text(encoding="utf-8"))
out.mkdir(parents=True, exist_ok=True)
index_file = out / "lines.json"
index = json.loads(index_file.read_text(encoding="utf-8")) if index_file.exists() else {}

for line in lines:
    if only and line["id"] not in only:
        continue
    text = line.get("say", line["text"])
    for pattern, spoken in SAY:
        text = re.sub(pattern, spoken, text)
    phonemes = kokoro.tokenizer.phonemize(text, lang)
    for heard, wanted in PHONEMES:
        phonemes = phonemes.replace(heard, wanted)
    audio, rate = kokoro.create(phonemes, voice=voice, speed=1.0, lang=lang, is_phonemes=True)
    sf.write(out / f"{line['id']}.wav", audio, rate)
    index[line["id"]] = round(len(audio) / rate, 3)
    print(f"{line['id']:8s} {index[line['id']]:5.2f} s  {phonemes}")

index_file.write_text(json.dumps(index, indent=1), encoding="utf-8")
print(f"total speech {sum(index.values()):.1f} s in {len(index)} lines ({voice}, {lang})")
