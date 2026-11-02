/** Captions-and-music announcement for Prince's personal account. Segments are silent and timed in segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("s1", async () => { await js("scene('s1')"); });
  await segment("s2", async () => { await js("scene('s2')"); });
  await segment("s3", async () => { await js("scene('s3')"); await wait(0.5); await js("chips(220)"); });
  // Show the demo from the app screens (prep.sh cuts it from 12s into video 1).
  await segment("s4", async () => { await js("scene('s4'); playDemo(0.2)"); });
  await segment("s5", async () => { await js("scene('s5')"); });
}
