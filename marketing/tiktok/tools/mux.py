"""Speed the raw recording back to real time, cover the sync marker, and lay the voice clips at their scene starts."""
import json, os, subprocess, sys

d = os.path.abspath(sys.argv[1])
t = json.load(open(f"{d}/build/timeline.json"))
tl = t["timeline"]
v0 = tl[0]["vstart"]
f = (tl[-1]["vstart"] - v0) / (tl[-1]["start"] - tl[0]["start"])
total = t["total"]
cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{v0:.3f}", "-i", t["raw"]]
flt = [
    f"[0:v]setpts=(PTS-STARTPTS)/{f:.5f},fps=30,drawbox=x=iw-10:y=ih-10:w=10:h=10:color=0x0b1220:t=fill,"
    f"format=yuv420p,trim=0:{total:.3f}[v]"
]
for i, seg in enumerate(tl):
    cmd += ["-i", f"{d}/build/vo/{seg['id']}.wav"]
    ms = int((seg["vstart"] - v0) / f * 1000)
    flt.append(f"[{i + 1}:a]adelay={ms}|{ms},apad[a{i}]")
n = len(tl)
flt.append(
    "".join(f"[a{i}]" for i in range(n))
    + f"amix=inputs={n}:normalize=0,atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5,aresample=44100[a]"
)
out = sys.argv[2] if len(sys.argv) > 2 else f"{d}/build/video.mp4"
cmd += ["-filter_complex", ";".join(flt), "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
print("speed factor", round(f, 4))
subprocess.run(cmd, check=True)
