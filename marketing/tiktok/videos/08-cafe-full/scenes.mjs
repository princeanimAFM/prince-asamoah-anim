/** The full café ordering walkthrough. Ids from segments.json. */
export default async function scenes({ segment, js, wait }) {
  await segment("hook", async () => { await js("scene('hook')"); });
  await segment("pain", async (d) => { await js("scene('pain')"); await js(`painPop(${Math.round((d * 1000 - 1500) / 7)})`); });
  await segment("intro", async () => { await js("scene('app'); view('v-menu')"); });
  await segment("share", async () => {
    await js("view('v-share')"); await wait(1.4);
    await js("tap('#sh-2')"); await wait(0.7); await js("shared('#sh-2', '✓ Shared')");
    await wait(0.9); await js("tap('#sh-3')"); await wait(0.7); await js("hideFinger(); shared('#sh-3', '✓ Printing')");
  });
  await segment("custom", async () => {
    await js("view('v-custom')"); await wait(1.0);
    await js("tap('#milk-oat')"); await wait(0.5); await js("pickMilk()");
    await wait(0.4); await js("tap('#ex-shot')"); await wait(0.5); await js("pickShot()");
    await wait(0.3); await js("hideFinger()");
  });
  await segment("cart", async () => {
    await js("tap('#b-add')"); await wait(0.7); await js("view('v-cart')");
    await wait(0.4); await js("hideFinger(); typeIn('#note', 'Nina', 120)");
    await wait(0.5); await js("tap('#t-0830')"); await wait(0.6); await js("pickTime()");
    await wait(0.4); await js("tap('#b-send')"); await wait(0.75);
    await js("hideFinger(); void toast('✅ Order sent to Little Cup<small>Pickup at 08:30 · pay at the counter</small>', 1800)");
  });
  await segment("board", async (d) => {
    await js("view('v-board')"); await wait(Math.max(2, d - 5.2));
    await js("tap('#st-33')"); await wait(0.75); await js("setStatus('cook', 'Brewing')");
    await wait(1.2); await js("tap('#st-33')"); await wait(0.75); await js("hideFinger(); setStatus('ready', 'Ready ✓')");
  });
  await segment("ready", async () => { await js("view('v-ready')"); });
  await segment("busy", async () => {
    await js("view('v-board')"); await wait(0.9);
    await js("tap('#sw-busy')"); await wait(0.7); await js("busyOn()");
    await wait(1.4); await js("hideFinger(); view('v-menu')");
  });
  await segment("soldout", async () => {
    await js("busyOff()");
    await js("view('v-stock')"); await wait(0.9); await js("tap('#sw-oat')"); await wait(0.7); await js("oatOut()");
    await wait(0.9); await js("hideFinger(); view('v-menu')");
  });
  await segment("loyalty", async () => { await js("view('v-loyalty')"); await wait(0.6); await js("stamps(260)"); });
  await segment("regulars", async () => {
    await js("view('v-regular')"); await wait(2.0); await js("tap('#b-again')"); await wait(0.75); await js("hideFinger(); again()");
  });
  await segment("day", async () => { await js("view('v-day')"); await wait(0.6); await js("bars()"); });
  await segment("addup", async () => { await js("view('v-add')"); await wait(0.4); await js("week(700)"); });
  await segment("reflect", async (d) => { await js("caption(''); scene('reflect')"); await wait(Math.max(1, d / 2)); await js("reflectLine()"); });
  await segment("cta", async () => { await js("scene('cta')"); });
}
