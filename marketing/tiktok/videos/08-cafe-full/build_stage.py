"""Builds stage.html for the café video from the polished church stage, reusing the barber video's component styles.
Run from marketing/tiktok: python3 videos/08-cafe-full/build_stage.py "$PWD"."""
import sys, random, re

base = sys.argv[1]
src = open(f"{base}/videos/05-church-full/stage.html").read()
head = src[:src.index("</style>")]
cta = src[src.index('<section id="cta"'):src.index("</section>", src.index('<section id="cta"')) + 10]
cta = cta.replace("Want this for <em>your</em> church or business?", "Want this for <em>your</em> business?")
script = src[src.index("<script>"):src.index("</script>")]
head = head.replace("<title>New Dawn Chapel full demo video</title>", "<title>Little Cup Coffee full demo video</title>")

# Component styles come from the barber video, recoloured: cocoa and terracotta on warm cream.
b = open(f"{base}/videos/07-barber-full/build_stage.py").read()
css = b[b.index('css = """') + 9:b.index('"""', b.index('css = """') + 9)]
for o, n in [("#211c18", "#2e1a14"), ("#3a322c", "#5a3326"), ("#4a3f36", "#6b3f2e"), ("#c27a2c", "#b5532f"), ("#f0b878", "#e8c49a"),
             ("#f5f1ea", "#f8f2e9"), ("#2a2420", "#2e211b"), ("rgba(33,28,24", "rgba(46,26,20"), ("rgba(240,184,120", "rgba(232,196,154"),
             ("rgba(33,28,24", "rgba(46,26,20"), ("#5a4a3c", "#7a4a36"), ("#f3e6d4", "#f6e3d0"), ("#fff8ee", "#fff6ee"), ("#cbb99f", "#d3b79c"),
             ("#0b0907", "#0c0605"), ("Corner Chair Barbers: charcoal and copper on warm cream", "Little Cup Coffee: cocoa and terracotta on warm cream")]:
    css = css.replace(o, n)
css += """
  .chips { display: flex; gap: 8px; padding: 4px 12px 0; flex-wrap: wrap; }
  .chp { background: #fff; border: 2px solid transparent; border-radius: 99px; padding: 9px 14px; font: 800 13px Nunito; color: var(--ink2); box-shadow: 0 4px 12px rgba(46,26,20,.07); transition: all .2s; }
  .chp small { font: 600 10px Nunito; color: #7b8496; margin-left: 4px; }
  .chp.sel { border-color: var(--gold); background: #fff6ee; }
  .drink { background: #fff; border-radius: 16px; padding: 8px 10px; display: grid; grid-template-columns: 52px 1fr auto; gap: 0 10px; align-items: center; box-shadow: 0 4px 12px rgba(46,26,20,.07); transition: opacity .3s; }
  .drink .ph { width: 52px; height: 52px; border-radius: 12px; display: grid; place-items: center; font-size: 28px; grid-row: span 2; }
  .drink b { font: 600 17px/1.1 Newsreader, serif; color: var(--ink2); } .drink small { font: 11px Nunito; color: #7b8496; }
  .drink .pr2 { font: 800 14px Nunito; color: var(--navy); grid-row: span 2; }
  .drink.sold { opacity: .5; }
  .busy { display: none; margin: 10px 12px 0; background: #fef3c7; color: #92400e; border-radius: 12px; padding: 10px 12px; font: 800 13px Nunito; text-align: center; }
  .busy.show { display: block; }
  .pausebar { margin: 12px 12px 0; background: #fff; border-radius: 14px; padding: 10px 12px; display: grid; grid-template-columns: 1fr auto; align-items: center; box-shadow: 0 4px 12px rgba(46,26,20,.07); }
  .pausebar b { font: 800 13px Nunito; color: var(--ink2); } .pausebar small { display: block; font: 11px Nunito; color: #7b8496; }
  .line { display: flex; justify-content: space-between; font: 14px Nunito; padding: 5px 0; color: var(--ink2); }
  .line.tot { font: 800 17px Nunito; border-top: 1.5px solid #e7e2d6; margin-top: 6px; padding-top: 9px; }
  .line small { display: block; font: 11px Nunito; color: #7b8496; }
  .times { display: flex; gap: 8px; padding: 6px 12px 0; }
  .time2 { flex: 1; text-align: center; background: #fff; border: 1.5px solid #e7e2d6; border-radius: 12px; padding: 9px 2px; font: 800 13px Nunito; color: var(--ink2); transition: all .2s; }
  .time2 small { display: block; font: 600 9px Nunito; color: #7b8496; }
  .time2.sel { background: var(--navy); color: #fff; border-color: var(--navy); } .time2.sel small { color: #e8c49a; }
  .time2.full { opacity: .4; text-decoration: line-through; }
  .nt2 { display: inline-block; margin-top: 3px; background: #fef3c7; color: #92400e; border-radius: 8px; padding: 3px 8px; font: 800 11px Nunito; }
  .field { margin-top: 6px; min-height: 30px; font: 17px/1.35 Newsreader, serif; color: var(--ink2); border-bottom: 1.5px solid #e7e2d6; padding-bottom: 6px; }
  .crow { display: grid; grid-template-columns: 42px 1fr auto; gap: 0 12px; align-items: center; background: #fff; border-radius: 16px; padding: 10px 12px; box-shadow: 0 4px 12px rgba(46,26,20,.07); }
  .avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; grid-row: span 2; }
  .crow b { font: 600 17px Newsreader, serif; } .crow small { font: 11px Nunito; color: #7b8496; }
  .stampcard { margin: 14px 12px 0; border-radius: 20px; padding: 18px 16px; color: #fff; background: linear-gradient(150deg, #7a4a36, #2e1a14); box-shadow: 0 8px 20px rgba(46,26,20,.3); }
  .stampcard small { font: 800 9px Nunito; letter-spacing: 1.5px; color: #e8c49a; text-transform: uppercase; }
  .stampcard b { display: block; font: 600 22px Newsreader, serif; margin: 4px 0 12px; }
  .stamps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .stamp { aspect-ratio: 1/1; border-radius: 50%; border: 2px dashed rgba(232,196,154,.6); display: grid; place-items: center; font-size: 20px; color: transparent; transition: all .3s cubic-bezier(.3,1.6,.6,1); transform: scale(.9); }
  .stamp.on { background: #e8c49a; border: 2px solid #e8c49a; color: #2e1a14; transform: scale(1); }
  .stamp.free { background: #16a34a; border-color: #16a34a; color: #fff; font: 800 11px Nunito; }
  .free-msg { margin: 14px 12px 0; text-align: center; font: 600 20px Newsreader, serif; color: var(--navy); opacity: 0; transition: opacity .5s; }
  .free-msg.show { opacity: 1; }
  .live { display: inline-block; background: #fee2e2; color: #b91c1c; font: 800 10px Nunito; border-radius: 99px; padding: 3px 8px; }
"""

random.seed(8)
def qr():
    cells = []
    for r in range(15):
        for c in range(15):
            fin = (r < 5 and c < 5) or (r < 5 and c > 9) or (r > 9 and c < 5)
            if fin:
                rr, cc = (r - 10 if r > 9 else r), (c - 10 if c > 9 else c)
                dark = rr in (0, 4) or cc in (0, 4) or (rr == 2 and cc == 2) or (rr in (1, 2, 3) and cc in (1, 2, 3) and (rr == 2 or cc == 2) and False)
                cells.append("<i></i>" if dark else '<i class="o"></i>')
            else:
                cells.append("<i></i>" if random.random() < .5 else '<i class="o"></i>')
    return "".join(cells)

home_tab = ('<div class="tabbar" style="grid-template-columns:repeat(4,1fr)">'
            '<span class="{a}"><svg viewBox="0 0 24 24"><path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5zM16 9h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/></svg>Menu</span>'
            '<span class="{b}"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>Orders</span>'
            '<span class="{c}"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>Today</span>'
            '<span class=""><svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>More</span></div>')
tab = lambda on: home_tab.format(a="on" if on == "menu" else "", b="on" if on == "orders" else "", c="on" if on == "today" else "")

def drink(did, emoji, bg, name, desc, price):
    return f'<div class="drink" id="{did}"><span class="ph" style="background:{bg}">{emoji}</span><b>{name}</b><span class="pr2">{price}</span><small>{desc}</small></div>'

menu = "\n        ".join([
    drink("d-flat", "☕", "#f6e3d0", "Flat white", "Double shot, silky milk", "3.50"),
    drink("d-cap", "🥛", "#efe7da", "Cappuccino", "Thick foam, cocoa dust", "3.40"),
    drink("d-iced", "🧊", "#dcebf0", "Iced latte", "Over ice, any milk", "3.90"),
    drink("d-bun", "🥐", "#fbe7b8", "Cinnamon bun", "Baked this morning", "2.80"),
])

body = f"""<div id="root">
<div id="cap"></div>
<div id="finger"></div>
<div id="mk" style="position:absolute;right:0;bottom:0;width:4px;height:4px;background:#000;z-index:99"></div>

<section id="hook" class="scene">
  <div class="emoji">☕</div>
  <div class="big">One link ends<br><em>the coffee queue</em></div>
  <div class="big small">for cafés and coffee shops 👀</div>
</section>

<section id="pain" class="scene">
  <div class="wa-top"><div class="av">💬</div><div>Messages<small>17 unread · queue to the door</small></div></div>
  <div class="badge-count">28</div>
  <div class="chat" style="padding-top:190px">
    <div class="msg"><b>Nina P.</b>Large oat latte, extra shot, no sugar!!<div class="t">08:01</div></div>
    <div class="msg"><b>Theo</b>Is the cinnamon bun still there? 🥐<div class="t">08:04</div></div>
    <div class="msg"><b>Maya</b>Decaf?? Or the normal one? Sorry!<div class="t">08:06</div></div>
    <div class="msg"><b>Ben</b>Lost my stamp card again 😩<div class="t">08:12</div></div>
    <div class="msg"><b>Theo</b>15 mins and still waiting…<div class="t">08:19</div></div>
    <div class="msg"><b>Missed call</b>📞 Nina P. (2)<div class="t">08:20</div></div>
  </div>
  <div class="note">Nina – oat?? shot??<br>Maya – <s>decaf</s><br>Ben – stamps?<br>Queue = out the door</div>
</section>

<section id="app" class="scene">
  <div class="phone"><div class="screen">

    <div class="view" id="v-menu">
      <div class="hero2">
        <span class="demo2">DEMO</span>
        <span class="plate">☕</span>
        <div class="inner">
          <span class="open">● ORDERING OPEN</span>
          <span class="welcome">ORDER FROM</span>
          <h2>Little Cup Coffee</h2>
          <p>littlecup.app · sample data</p>
        </div>
      </div>
      <div class="busy" id="busy">⏱ Busy right now · orders take about 10 min longer</div>
      <div class="lbl2" style="padding:12px 14px 6px">Popular</div>
      <div class="svlist" id="menu-list">
        {menu}
      </div>
      {tab('menu')}
    </div>

    <div class="view off" id="v-share">
      <div class="head2"><h1>Share your menu <span class="demo">DEMO</span></h1><p>One link, everywhere</p></div>
      <div class="qrcard"><div class="qr">{qr()}</div><b>Scan to order</b><small>littlecup.app/menu · counter, tables and bio</small></div>
      <div class="sharerow"><span id="sh-1">Copy link</span><span id="sh-2">Share to status</span><span id="sh-3">Print code</span></div>
      <div class="tip" style="margin-top:14px">Always today's menu and prices.</div>
    </div>

    <div class="view off" id="v-custom">
      <div class="head2"><p class="back">‹ Menu</p><h1>Flat white <span class="demo">DEMO</span></h1><p>Double shot, silky milk · 3.50</p></div>
      <div class="lbl2" style="padding:12px 14px 6px">Size</div>
      <div class="chips"><span class="chp">Small</span><span class="chp sel">Regular</span><span class="chp">Large <small>+0.50</small></span></div>
      <div class="lbl2" style="padding:12px 14px 6px">Milk</div>
      <div class="chips"><span class="chp">Whole</span><span class="chp" id="milk-oat">Oat <small>+0.50</small></span><span class="chp">Almond <small>+0.50</small></span></div>
      <div class="lbl2" style="padding:12px 14px 6px">Extras</div>
      <div class="chips"><span class="chp" id="ex-shot">Extra shot <small>+0.60</small></span><span class="chp">Syrup <small>+0.40</small></span></div>
      <button class="btn2" id="b-add" style="position:absolute;left:0;right:0;bottom:70px;width:auto">Add to order · 3.50</button>
      {tab('menu')}
    </div>

    <div class="view off" id="v-cart">
      <div class="head2"><p class="back">‹ Menu</p><h1>Your order <span class="demo">DEMO</span></h1><p>Little Cup Coffee</p></div>
      <div class="c2" style="margin:10px 12px 0;background:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 6px 16px rgba(46,26,20,.08)">
        <div class="line"><span>Flat white<small>Regular · oat milk · extra shot</small></span><span>4.60</span></div>
        <div class="line"><span>Cinnamon bun</span><span>2.80</span></div>
        <div class="line tot"><span>Total</span><span>7.40</span></div>
        <span class="lbl2" style="display:block;margin-top:8px">Name for the cup</span><div class="field" id="note"></div>
      </div>
      <div class="lbl2" style="padding:10px 14px 0">Pickup time</div>
      <div class="times"><span class="time2 full">08:10<small>full</small></span><span class="time2" id="t-0830">08:20<small>2 left</small></span><span class="time2">08:30<small>free</small></span><span class="time2">08:40<small>free</small></span></div>
      <button class="btn2" id="b-send">Send order · pay at the counter</button>
    </div>

    <div class="view off" id="v-board">
      <div class="head2"><h1>Orders <span class="demo">DEMO</span></h1><p>Bar screen · in the order they came in</p></div>
      <div class="pausebar"><div><b id="busy-b">Normal pace</b><small id="busy-s">Orders ready in about 5 min</small></div><span class="switch" id="sw-busy" style="background:#16a34a"></span></div>
      <div class="sl" style="gap:8px">
        <div class="tk done"><span class="tm">#31</span><b>Theo</b><span class="st done">Ready ✓</span><p>Cappuccino · whole milk</p></div>
        <div class="tk chair"><span class="tm">#32</span><b>Maya</b><span class="st chair">Brewing</span><p>Iced latte · large · almond · syrup</p></div>
        <div class="tk next" id="tk-33"><span class="tm">#33</span><b>Nina P.</b><span class="st" id="st-33">New · start</span><p>Flat white · oat · extra shot + bun<br><span class="nt2">📝 Name on cup: Nina</span></p></div>
      </div>
      {tab('orders')}
    </div>

    <div class="view off" id="v-ready">
      <div class="lockscreen">
        <div class="time">08:27</div><div class="date">Nina's phone</div>
        <div class="notif show" style="position:relative;top:auto;left:auto;right:auto;margin:40px 14px 0"><span class="ap">☕</span><b>Little Cup Coffee</b><span>Your order #33 is ready at the counter ☕</span></div>
      </div>
    </div>

    <div class="view off" id="v-stock">
      <div class="head2"><h1>Today's menu <span class="demo">DEMO</span></h1><p>Switch off what has run out</p></div>
      <div class="sl">
        <div class="crow"><span class="avatar" style="background:#f6e3d0;font-size:20px">☕</span><b>Flat white</b><span class="switch"></span><small>Available</small></div>
        <div class="crow"><span class="avatar" style="background:#efe7da;font-size:20px">🥛</span><b>Oat milk</b><span class="switch" id="sw-oat"></span><small id="oat-s">Almost out</small></div>
        <div class="crow"><span class="avatar" style="background:#fbe7b8;font-size:20px">🥐</span><b>Cinnamon bun</b><span class="switch"></span><small>Available</small></div>
        <div class="crow"><span class="avatar" style="background:#dcebf0;font-size:20px">🧊</span><b>Iced latte</b><span class="switch"></span><small>Available</small></div>
      </div>
      <div class="tip">Hidden items come back tomorrow, by themselves.</div>
    </div>

    <div class="view off" id="v-loyalty">
      <div class="head2"><h1>Your stamp card <span class="demo">DEMO</span></h1><p>Little Cup Coffee · lives in your phone</p></div>
      <div class="stampcard"><small>Coffee stamps</small><b>Every 10th coffee is free</b>
        <div class="stamps" id="stamps">{"".join('<span class="stamp">☕</span>' for _ in range(10))}</div>
      </div>
      <div class="free-msg" id="free-msg">Your next coffee is free 🎉</div>
    </div>

    <div class="view off" id="v-regular">
      <div class="head2"><h1>Welcome back, Nina <span class="demo">DEMO</span></h1><p>Little Cup Coffee · your 24th visit</p></div>
      <div class="usual"><small>Your usual</small><b>Flat white, oat, extra shot</b><p>Regular · name on cup: Nina · 4.60</p></div>
      <button class="btn2 goldb" id="b-again">Order again</button>
      <div class="tip" style="margin-top:14px">Or browse the menu for something new.</div>
    </div>

    <div class="view off" id="v-day">
      <div class="head2"><h1>Today <span class="demo">DEMO</span></h1><p>Example day · sample data</p></div>
      <div class="day3"><div><b>118</b><small>orders</small></div><div><b>4 min</b><small>avg wait</small></div><div><b>96</b><small>stamps given</small></div></div>
      <div class="c2" style="margin:12px;background:#fff;border-radius:16px;padding:14px;box-shadow:0 6px 16px rgba(46,26,20,.08)"><span class="lbl2">Orders by hour</span>
        <div class="bars" style="margin-top:10px">
          <div class="bar2"><span>7–8 am</span><i data-w="72"></i><span>31</span></div>
          <div class="bar2"><span>8–9 am</span><i data-w="100"></i><span>43</span></div>
          <div class="bar2"><span>9–10 am</span><i data-w="58"></i><span>25</span></div>
          <div class="bar2"><span>10–11 am</span><i data-w="30"></i><span>13</span></div>
          <div class="bar2"><span>11–12</span><i class="low" data-w="14"></i><span>6</span></div>
        </div>
      </div>
      <div class="tip">Put another barista on at 8. Bake more buns.</div>
      {tab('today')}
    </div>

    <div class="view off" id="v-add">
      <div class="head2"><h1>This week <span class="demo">DEMO</span></h1><p>Example week · sample data</p></div>
      <div class="wk">
        <div><b>0</b><small>wrong orders</small></div>
        <div><b>0</b><small>lost stamp cards</small></div>
        <div><b>4 min</b><small>average wait (was 11)</small></div>
        <div><b>718</b><small>orders, all clear</small></div>
        <div><b>41</b><small>regulars came back</small></div>
        <div><b>38</b><small>free coffees earned</small></div>
      </div>
      <div class="heart" id="heart">Back to the coffee.</div>
    </div>

    <div class="toast" id="toast"></div>
  </div></div>
</section>

<section id="reflect" class="scene">
  <div class="big">☕</div>
  <div class="rq">You opened a café to bring people <em>together</em> over a good cup,<br>not to shout orders over a machine.</div>
  <div class="rs">Let the app take the orders.<br>You get back to the coffee.</div>
</section>

{cta}

</div>
"""

js = """
  window.pickMilk = () => $("#milk-oat").classList.add("sel");
  window.pickShot = () => { $("#ex-shot").classList.add("sel"); $("#b-add").textContent = "Add to order · 4.60"; };
  window.pickTime = () => $("#t-0830").classList.add("sel");
  window.setStatus = (cls, label) => { const s = $("#st-33"), t = $("#tk-33"); s.className = "st " + cls; s.textContent = label; t.className = "tk " + (cls === "ready" ? "done" : "chair"); };
  window.busyOn = () => { $("#sw-busy").style.background = "#cbd5e1"; $("#busy-b").textContent = "Busy mode on"; $("#busy-s").textContent = "Customers see +10 min on every order"; $("#busy").classList.add("show"); };
  window.busyOff = () => { $("#sw-busy").style.background = "#16a34a"; $("#busy-b").textContent = "Normal pace"; $("#busy-s").textContent = "Orders ready in about 5 min"; $("#busy").classList.remove("show"); };
  window.oatOut = () => { $("#sw-oat").classList.add("off"); $("#oat-s").textContent = "Sold out today"; };
  window.shared = (id, label) => { const b = $(id); b.classList.add("done"); b.textContent = label; };
  window.stamps = async (gap) => { const all = [...document.querySelectorAll(".stamp")]; for (let i = 0; i < all.length; i++) { await sleep(gap); if (i < 9) all[i].classList.add("on"); else { all[i].classList.add("on", "free"); all[i].textContent = "FREE"; } } $("#free-msg").classList.add("show"); };
  window.again = () => { const b = $("#b-again"); b.textContent = "✓ Ordered · ready at 08:40"; b.style.background = "#16a34a"; b.style.color = "#fff"; };
  window.bars = () => document.querySelectorAll(".bar2 i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
"""

out = head + css + "</style>\n</head>\n<body>\n" + body + script + js + "</script>\n</body>\n</html>\n"
open(f"{base}/videos/08-cafe-full/stage.html", "w").write(out)
print("ok")
