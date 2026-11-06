/** The full (about 3 minute) church app walkthrough. Ids from segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 1500) / 6)})`); });
  await segment("intro", async () => { await js("scene('app'); view('v-home')"); });
  await segment("announce", async () => {
    await js("view('v-post')"); await wait(0.3);
    await js("typeIn('#ann-text', 'Youth night moved to Friday, 7pm. See you there!', 22)");
    await js("tap('#b-ann')"); await wait(0.75);
    await js("hideFinger(); view('v-home')"); await wait(0.35); await js("notify()");
  });
  await segment("sermons", async (d) => {
    await js("view('v-sermons')"); await wait(Math.max(1, d / 2 - 1));
    await js("tap('#b-play')"); await wait(0.75); await js("hideFinger(); play()");
  });
  await segment("bible", async () => { await js("view('v-verse')"); });
  await segment("prayer", async () => {
    await js("view('v-prayer')"); await wait(1.2); await js("tap('#pray-1')"); await wait(0.75); await js("pray('#pray-1')"); await js("hideFinger()");
  });
  await segment("visitors", async () => {
    await js("view('v-visit')"); await wait(0.4);
    await js("typeField('#vf-name', 'Anna K.', 45)");
    await js("typeField('#vf-pray', 'For my new job in the city', 25)");
    await js("tap('#b-visit')"); await wait(0.75); await js("hideFinger(); showTask()");
  });
  await segment("care", async (d) => {
    await js("view('v-care')"); await wait(Math.max(1.5, d - 4));
    await js("tap('#reach-1')"); await wait(0.75); await js("reach('#reach-1')");
    await js("hideFinger(); void toast('💜 Elder Mark will check in with David<small>Reminder set for tomorrow</small>', 2200)");
  });
  await segment("events", async () => {
    await js("view('v-events')"); await wait(1.0); await js("tap('#b-rsvp')"); await wait(0.75); await js("hideFinger(); rsvp()");
  });
  await segment("serve", async () => {
    await js("view('v-serve')"); await wait(1.5); await js("tap('#serve-k')"); await wait(0.75); await js("hideFinger(); fillGap()");
  });
  await segment("week", async () => { await js("view('v-week')"); await wait(0.4); await js("week(600)"); });
  await segment("reflect", async (d) => {
    await js("caption(''); scene('reflect')"); await wait(0.6); await js("names(450)");
    await wait(Math.max(1, d / 2)); await js("reflectLine()");
  });
  await segment("cta", async () => { await js("scene('cta')"); });
}
