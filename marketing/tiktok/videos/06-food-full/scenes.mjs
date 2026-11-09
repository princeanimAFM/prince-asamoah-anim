/** The full (about 2.5 minute) food ordering walkthrough. Ids from segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 1500) / 7)})`); });
  await segment("intro", async () => { await js("scene('app'); view('v-menu')"); });
  await segment("share", async () => {
    await js("view('v-share')"); await wait(1.6);
    await js("tap('#sh-2')"); await wait(0.7); await js("shared('#sh-2', '✓ Shared')");
    await wait(1.0); await js("tap('#sh-3')"); await wait(0.7); await js("hideFinger(); shared('#sh-3', '✓ Printing')");
  });
  await segment("order", async () => {
    await js("view('v-menu')"); await wait(0.5);
    await js("tap('#add-burger')"); await wait(0.7); await js("addFood('#add-burger', '1', ['1 item', 'View order · 11'])");
    await wait(0.15); await js("tap('#add-burger')"); await wait(0.7); await js("addFood('#add-burger', '2', ['2 items', 'View order · 22'])");
    await wait(0.15); await js("tap('#add-fries')"); await wait(0.7); await js("addFood('#add-fries', '1', ['3 items', 'View order · 26'])");
    await wait(0.15); await js("tap('#cart')"); await wait(0.7); await js("view('v-cart')");
    await wait(0.3); await js("hideFinger(); typeIn('#note', 'No onions on the burgers', 35)");
  });
  await segment("pickup", async () => {
    await wait(0.4); await js("tap('#t-1230')"); await wait(0.7); await js("pickTime()");
    await wait(0.6); await js("tap('#b-send')"); await wait(0.75);
    await js("hideFinger(); void toast('✅ Order sent to Mo’s Kitchen<small>Pickup at 12:30 · pay on pickup</small>', 1800)");
    await js("clearCart()");
  });
  await segment("kitchen", async (d) => {
    await js("view('v-kitchen')"); await wait(Math.max(2, d - 5.2));
    await js("tap('#st-24')"); await wait(0.75); await js("setStatus('cook', 'Cooking')");
    await wait(1.2); await js("tap('#st-24')"); await wait(0.75); await js("hideFinger(); setStatus('ready', 'Ready ✓')");
  });
  await segment("notify", async () => { await js("view('v-ready')"); });
  await segment("pause", async () => {
    await js("view('v-kitchen')"); await wait(1.0);
    await js("tap('#sw-pause')"); await wait(0.7); await js("pauseOrders()");
    await wait(1.4); await js("hideFinger(); view('v-menu')");
  });
  await segment("soldout", async () => {
    await js("resumeOrders()");
    await js("view('v-stock')"); await wait(0.9); await js("tap('#sw-bowl')"); await wait(0.7); await js("bowlOut()");
    await wait(0.9); await js("hideFinger(); view('v-menu')");
  });
  await segment("regulars", async () => {
    await js("view('v-regular')"); await wait(2.2); await js("tap('#b-again')"); await wait(0.75); await js("hideFinger(); again()");
  });
  await segment("day", async () => { await js("view('v-day')"); await wait(0.6); await js("bars()"); });
  await segment("addup", async () => { await js("view('v-add')"); await wait(0.4); await js("week(700)"); });
  await segment("reflect", async (d) => { await js("caption(''); scene('reflect')"); await wait(Math.max(1, d / 2)); await js("reflectLine()"); });
  await segment("cta", async () => { await js("scene('cta')"); });
}
