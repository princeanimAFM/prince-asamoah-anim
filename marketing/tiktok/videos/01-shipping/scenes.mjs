/** What happens on screen during each voice-over segment (ids from segments.json). */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 900) / 6)})`); });
  await segment("intro", async () => {
    await js("scene('app'); view('v-home')");
    await wait(2.6); await js("tap('#t-unpaid')"); await wait(0.9);
    await js("document.querySelector('#t-unpaid').classList.add('on'); document.querySelector('#t-all').classList.remove('on')");
    await wait(1.0); await js("document.querySelector('#t-all').classList.add('on'); document.querySelector('#t-unpaid').classList.remove('on')");
    await wait(0.4); await js("tap('#r-esi')"); await wait(0.75); await js("view('v-parcel')");
  });
  await segment("update", async () => {
    await wait(0.5); await js("tap('#b-update')"); await wait(0.75); await js("markArrived()");
    await js("toast('✅ Text sent to Sarah K.<small>\"Your parcel KS-2041 has arrived at port\"</small>', 2600)");
  });
  await segment("track", async () => {
    await js("tap('#b-share')"); await wait(0.75); await js("hideFinger(); view('v-track')");
  });
  await segment("remind", async () => {
    await js("view('v-unpaid')"); await wait(0.8);
    await js("tap('#rem-all')"); await wait(0.75);
    for (const id of ["#rem-1", "#rem-2", "#rem-3"]) { await js(`remind('${id}')`); await wait(0.25); }
    await js("hideFinger(); toast('✅ 3 reminders sent by text<small>With each customer’s amount and payment details</small>', 2000)");
  });
  await segment("cta", async () => { await js("caption(''); scene('cta')"); });
}
