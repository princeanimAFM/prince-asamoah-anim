#!/usr/bin/env bash
# Build one video: voice-over, recording, sync, final MP4 (with and without voice).
# Usage: tools/make.sh videos/<name> <output-name> [voice]
set -euo pipefail
cd "$(dirname "$0")/.."
V="$1"; OUT="$2"; VOICE="${3:-am_michael}"
C="${TTS_DIR:-$HOME/.cache/rmr-tiktok}"
[ -x "$V/prep.sh" ] && "$V/prep.sh"  # optional per-video preparation
"$C/venv/bin/python" -I tools/tts.py "$V" "$VOICE"
node tools/record.mjs "$V"
python3 -I tools/sync.py "$V"
python3 -I tools/mux.py "$V" "$V/build/$OUT.mp4"
ffmpeg -v error -y -i "$V/build/$OUT.mp4" -an -c:v copy -movflags +faststart "$V/build/$OUT-no-voice.mp4"
echo "Done: $V/build/$OUT.mp4"
