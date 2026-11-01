"""Voice each segment with Kokoro (free, runs locally). Writes build/vo/<id>.wav and build/segments.json with durations.
Usage: python tools/tts.py videos/<name> [voice]   (default voice am_michael)"""
import json, os, sys
import soundfile as sf
from kokoro_onnx import Kokoro

d = os.path.abspath(sys.argv[1]); voice = sys.argv[2] if len(sys.argv) > 2 else "am_michael"
models = os.environ.get("TTS_DIR", os.path.expanduser("~/.cache/rmr-tiktok"))
k = Kokoro(f"{models}/kokoro-v1.0.onnx", f"{models}/voices-v1.0.bin")
os.makedirs(f"{d}/build/vo", exist_ok=True)
segs = json.load(open(f"{d}/segments.json"))
for s in segs:
    audio, sr = k.create(s["text"], voice=voice, speed=1.05, lang="en-us")
    sf.write(f"{d}/build/vo/{s['id']}.wav", audio, sr)
    s["dur"] = round(len(audio) / sr, 3)
    print(s["id"], s["dur"])
json.dump(segs, open(f"{d}/build/segments.json", "w"), indent=1, ensure_ascii=False)
