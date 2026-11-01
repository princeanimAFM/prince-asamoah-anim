# RMR Dev Works TikTok videos

Short vertical videos (about 40 seconds, 1080×1920). Each one shows a common business problem and a
demo app that fixes it. The demo apps are for made-up businesses with sample data, marked DEMO.

## Rules
- Brand and contact rules are in the repo's `CLAUDE.md` (RMR Dev Works brand): blue blocks logo, Baloo 2
  and Nunito, no country or nationality. Customers contact Prince by TikTok messages or email only, so
  never show WhatsApp or a phone number. Demo apps send "messages" or "texts".
- Never use real clients, AFM HUB, Church Care or real people in the videos.

## Making a video
One-time setup (Python venv with the free Kokoro voice and its model files, ~350 MB):

```
tools/setup.sh
```

Then for a video folder `videos/<nn-name>/`:

```
tools/make.sh videos/02-clothing rmr-video-2-clothing
```

This writes `videos/<name>/build/<output>.mp4` and `<output>-no-voice.mp4`. `build/` is not committed.

A video folder has:
- `segments.json`: the voice-over, one segment per scene: `id`, `text` (what's said) and `cap`
  (the on-screen caption; `<mark>` highlights words, empty for none).
- `stage.html`: the scenes and the demo app, drawn at 540×960 and scaled ×2. It must keep the helper
  functions `scene`, `caption`, `mark`, `tap` and the `#mk` corner marker that `record.mjs` uses.
- `scenes.mjs`: what happens on screen during each segment.
- `script.md`: the script with timings, the post caption and posting notes.

How it works: `tts.py` voices each segment. `record.mjs` plays the stage in Chromium in time with the
voice and records it. The recording runs slightly slow, so `sync.py` finds each segment's start from
a colour marker in the corner. `mux.py` then speeds the video back up, covers the marker and lays the
voice clips at those starts.

The voice is Kokoro (Apache-2.0 model, MIT `kokoro-onnx`), which allows commercial use. Default voice
`am_michael`; pass another as the third argument to `make.sh`.

## Video plan
1. ✅ Shipping / freight: chasing payments, "where's my parcel?" (`videos/01-shipping`)
2. Clothing brand / tailor: re-posting every item; an online catalogue customers order from with their size
3. Restaurant / food vendor: orders by voice note; menu link and neat orders, sold-out items hidden
4. Salon / barber: everyone arrives at once, no-shows; booking page with time slots and reminders
5. Landlord / rentals: forgetting who paid rent; tenant list, due dates, reminders, receipts
6. School / lesson teacher: fees owed, results sent one by one; a parents' page
7. Perfume / cosmetics: "how much?" for every item; catalogue with prices and an order button
8. Event planner: guest lists on paper; RSVP page with QR check-in
9. Car rental: who has which car, deposits; bookings calendar and agreements
10. Pharmacy / shop: running out of stock; stock list with low-stock alerts
11. Photographer: sending photos one by one; a private gallery link per client
12. Cleaning / delivery teams: not knowing who's where; job list and status updates

Every 4th post: "day in my life building an app". Post 3 a week, 7 to 9 pm.
