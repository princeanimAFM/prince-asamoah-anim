/** What happens on screen during each voice-over segment (ids from segments.json). */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 900) / 5)})`); });
  await segment("intro", async (d) => {
    await js("scene('app'); view('v-cat')");
    await wait(d - 1.6); await js("tap('#i-dress')"); await wait(0.75); await js("view('v-item')");
  });
  await segment("order", async () => {
    await wait(0.3); await js("tap('#sz-l')"); await wait(0.7); await js("pickSize('#sz-l', 'L')");
    await wait(0.5); await js("tap('#b-order')"); await wait(0.75);
    await js("hideFinger(); toast('✅ Order sent to Lena’s Studio<small>Wrap dress · Blue · size L</small>', 2200)");
  });
  await segment("soldout", async () => {
    await js("view('v-items')"); await wait(0.6);
    await js("tap('#sw-shirt')"); await wait(0.7); await js("soldOut()");
    await wait(0.9); await js("hideFinger(); view('v-cat')");
  });
  await segment("orders", async () => {
    await js("view('v-orders')"); await wait(0.5);
    await js("toast('🛍️ New order from Grace N.<small>Wrap dress · size L · ready to pack</small>', 2000)");
  });
  await segment("cta", async () => { await js("caption(''); scene('cta')"); });
}
