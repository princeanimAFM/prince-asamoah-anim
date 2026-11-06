"""Use a person's own voice-over instead of the AI voice.

The script is read in one take, with a pause of about 2 seconds between sections. This finds the
longest pauses, cuts the recording into one clip per segment (in segments.json order), and writes
build/vo/<id>.wav and build/segments.json, just as tts.py does.

Usage: python tools/use_recording.py videos/<name> recording.m4a
"""
import json, os, re, subprocess, sys

d = os.path.abspath(sys.argv[1]); rec = os.path.abspath(sys.argv[2])
segs = json.load(open(f"{d}/segments.json"))
n = len(segs)
os.makedirs(f"{d}/build/vo", exist_ok=True)

total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", rec],
                             capture_output=True, text=True, check=True).stdout)
log = subprocess.run(["ffmpeg", "-i", rec, "-af", "silencedetect=n=-38dB:d=0.9", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
pauses = [(e - s, s, e) for s, e in zip(starts, ends) if s > 0.5 and e < total - 0.5]
if len(pauses) < n - 1:
    sys.exit(f"Found {len(pauses)} pauses but need {n - 1}. Ask for a 2-second pause between sections.")
# The n-1 longest pauses are the section breaks; cut in the middle of each.
breaks = sorted(pauses, reverse=True)[: n - 1]
cuts = sorted((s + e) / 2 for _, s, e in breaks)
bounds = [0.0] + cuts + [total]
for i, seg in enumerate(segs):
    a, b = bounds[i], bounds[i + 1]
    out = f"{d}/build/vo/{seg['id']}.wav"
    # Trim the silence at each end of the clip, then keep a short natural breath.
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", rec, "-af",
                    "silenceremove=start_periods=1:start_threshold=-40dB,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-40dB,areverse,"
                    "adelay=150|150,apad=pad_dur=0.15", "-ar", "24000", "-ac", "1", out], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out],
                               capture_output=True, text=True, check=True).stdout)
    seg["dur"] = round(dur, 3)
    print(seg["id"], seg["dur"])
json.dump(segs, open(f"{d}/build/segments.json", "w"), indent=1, ensure_ascii=False)
