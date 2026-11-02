#!/usr/bin/env bash
# The recording browser can't play H.264, so cut the app part of video 1 into a WebM clip.
# Needs video 1 built first: tools/make.sh videos/01-shipping rmr-video-1-shipping
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
ffmpeg -v error -y -ss 12 -t 8 -i ../01-shipping/build/rmr-video-1-shipping-no-voice.mp4 -vf scale=540:960 -c:v libvpx-vp9 -b:v 1.5M -an build/demo.webm
