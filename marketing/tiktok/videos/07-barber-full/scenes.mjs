/** The full barber booking walkthrough. Ids from segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 1500) / 7)})`); });
  await segment("intro", async () => { await js("scene('app'); view('v-book')"); });
  await segment("share", async () => {
    await js("view('v-share')"); await wait(1.6);
    await js("tap('#sh-2')"); await wait(0.7); await js("shared('#sh-2', '✓ Shared')");
    await wait(1.0); await js("tap('#sh-3')"); await wait(0.7); await js("hideFinger(); shared('#sh-3', '✓ Printing')");
  });
  await segment("pick", async () => {
    await js("view('v-pick')"); await wait(0.8);
    await js("tap('#svc-fade')"); await wait(0.5); await js("pickSvc()");
    await wait(0.5); await js("tap('#bar-jo')"); await wait(0.5); await js("hideFinger(); pickBarber()");
  });
  await segment("time", async () => {
    await js("view('v-time')"); await wait(1.4);
    await js("tap('#slot-1430')"); await wait(0.6); await js("hideFinger(); pickSlot()");
  });
  await segment("confirm", async () => {
    await wait(0.3); await js("tap('#b-book')"); await wait(0.75);
    await js("hideFinger(); void toast('✅ Booked with Jo<small>Sat 14:30 · Corner Chair Barbers</small>', 1600)");
    await wait(0.5); await js("view('v-done')");
  });
  await segment("remind", async () => { await js("view('v-remind')"); await wait(0.5); await js("$('#remind-n').classList.add('show')"); });
  await segment("day", async (d) => {
    await js("view('v-day')"); await wait(Math.max(1.5, d - 5));
    await js("tap('#st-dan')"); await wait(0.75); await js("setDan('arr', 'Arrived')");
    await wait(1.0); await js("tap('#st-dan')"); await wait(0.75); await js("hideFinger(); setDan('done', 'Done ✓')");
  });
  await segment("cancel", async () => {
    await js("view('v-day')"); await wait(0.9);
    await js("cancelJay()"); await js("void toast('Jay K. cancelled<small>Your 15:20 slot is open again</small>', 1800)");
    await wait(1.8); await js("fillJay()");
  });
  await segment("regulars", async () => {
    await js("view('v-regular')"); await wait(2.0); await js("tap('#b-again')"); await wait(0.75); await js("hideFinger(); again()");
  });
  await segment("stats", async () => { await js("view('v-stats')"); await wait(0.6); await js("bars()"); });
  await segment("addup", async () => { await js("view('v-add')"); await wait(0.4); await js("week(700)"); });
  await segment("reflect", async (d) => { await js("caption(''); scene('reflect')"); await wait(Math.max(1, d / 2)); await js("reflectLine()"); });
  await segment("cta", async () => { await js("scene('cta')"); });
}
