#!/usr/bin/env bash
# One-time setup: a Python environment with the Kokoro voice, and its model files (~350 MB).
set -euo pipefail
C="${TTS_DIR:-$HOME/.cache/rmr-tiktok}"
mkdir -p "$C"
[ -x "$C/venv/bin/python" ] || python3 -m venv "$C/venv"
"$C/venv/bin/pip" install -q --progress-bar off kokoro-onnx soundfile
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$C/$f" ] || curl -sSL -o "$C/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done
echo "Ready: $C"
