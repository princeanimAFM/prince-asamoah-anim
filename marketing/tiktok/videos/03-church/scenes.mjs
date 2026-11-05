/** A longer (about one minute) walkthrough of a demo church app. Ids from segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 1200) / 5)})`); });
  await segment("intro", async () => { await js("scene('app'); view('v-home')"); });
  await segment("announce", async () => {
    await js("view('v-post')"); await wait(0.3);
    await js("typeIn('#ann-text', 'Youth night moved to Friday, 7pm. See you there!', 12)");
    await js("tap('#b-ann')"); await wait(0.75);
    await js("hideFinger(); view('v-home')"); await wait(0.35); await js("notify()");
  });
  await segment("sermons", async () => {
    await js("view('v-sermons')"); await wait(0.6); await js("tap('#b-play')"); await wait(0.75); await js("hideFinger(); play()");
  });
  await segment("prayer", async () => {
    await js("view('v-prayer')"); await wait(0.5); await js("tap('#pray-1')"); await wait(0.75); await js("pray('#pray-1')"); await js("hideFinger()");
  });
  await segment("care", async () => {
    await js("view('v-care')"); await wait(3.2); await js("tap('#reach-1')"); await wait(0.75); await js("reach('#reach-1')");
    await js("hideFinger(); toast('💜 Elder Mark will check in with David<small>Reminder set for tomorrow</small>', 2200)");
  });
  await segment("events", async () => {
    await js("view('v-events')"); await wait(0.6); await js("tap('#b-rsvp')"); await wait(0.75); await js("hideFinger(); rsvp()");
  });
  await segment("week", async () => { await js("view('v-week')"); await wait(0.4); await js("week(650)"); });
  await segment("cta", async () => { await js("caption(''); scene('cta')"); });
}
