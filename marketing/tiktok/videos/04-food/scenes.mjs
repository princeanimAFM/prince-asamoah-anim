/** What happens on screen during each voice-over segment (ids from segments.json). */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 900) / 6)})`); });
  await segment("intro", async () => {
    await js("scene('app'); view('v-menu')"); await wait(0.6);
    await js("tap('#add-burger')"); await wait(0.7); await js("addItem('#add-burger', '1', ['1 item', 'View order · 11'])");
    await wait(0.2); await js("tap('#add-burger')"); await wait(0.7); await js("addItem('#add-burger', '2', ['2 items', 'View order · 22'])");
    await wait(0.2); await js("tap('#add-fries')"); await wait(0.7); await js("addItem('#add-fries', '1', ['3 items', 'View order · 26'])");
    await wait(0.2); await js("tap('#cartbar')"); await wait(0.7); await js("view('v-cart')");
    await wait(0.3); await js("hideFinger(); typeNote('No onions on the burgers')");
  });
  await segment("send", async () => {
    await wait(0.2); await js("tap('#b-send')"); await wait(0.75);
    await js("hideFinger(); view('v-kitchen')"); await wait(0.4);
    await js("toast('🔔 New order #24 from Nora K.<small>2 × Beef burger, 1 × Fries · no onions</small>', 2400)");
  });
  await segment("soldout", async () => {
    await js("view('v-stock')"); await wait(0.6);
    await js("tap('#sw-fries')"); await wait(0.7); await js("soldOut()");
    await wait(0.9); await js("hideFinger(); view('v-menu')");
  });
  await segment("cta", async () => { await js("caption(''); scene('cta')"); });
}
