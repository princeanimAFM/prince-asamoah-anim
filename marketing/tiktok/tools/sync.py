"""Find when each segment's marker colour first appears in the raw recording."""
import json, os, subprocess, sys
d = sys.argv[1]; d = os.path.abspath(d); t = json.load(open(f"{d}/build/timeline.json"))
W, H = 1080, 1920
probe = subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","frame=pts_time","-of","csv=p=0",t["raw"]],capture_output=True,text=True).stdout.split()
times = [float(x) for x in probe if x]
raw = subprocess.run(["ffmpeg","-v","error","-i",t["raw"],"-vf",f"crop=4:4:{W-6}:{H-6},scale=1:1","-f","rawvideo","-pix_fmt","rgb24","-vsync","passthrough","-"],capture_output=True).stdout
px = [tuple(raw[i:i+3]) for i in range(0, len(raw), 3)]
hexrgb = lambda h: tuple(int(h[i:i+2],16) for i in (1,3,5))
k = 0
for seg in t["timeline"]:
    c = hexrgb(seg["color"])
    while k < len(px) and sum(abs(a-b) for a,b in zip(px[k], c)) > 120: k += 1
    seg["vstart"] = times[k] if k < len(times) else None
    print(seg["id"], round(seg["start"],2), seg["vstart"])
t["vend"] = t["timeline"][-1]["vstart"] + (t["total"] - t["timeline"][-1]["start"])
json.dump(t, open(f"{d}/build/timeline.json","w"), indent=1)
