"""Builds stage.html from the polished church stage. Run from marketing/tiktok: python3 videos/06-food-full/build_stage.py "$PWD"."""
import sys

base = sys.argv[1]
src = open(f"{base}/videos/05-church-full/stage.html").read()
head = src[:src.index("</style>")]
cta = src[src.index('<section id="cta"'):src.index("</section>", src.index('<section id="cta"')) + 10]
cta = cta.replace("Want this for <em>your</em> church or business?", "Want this for <em>your</em> business?")
script = src[src.index("<script>"):src.index("</script>")]
head = head.replace("<title>New Dawn Chapel full demo video</title>", "<title>Mo's Kitchen full demo video</title>")

css = """
  /* Mo's Kitchen: deep green, tomato and mustard on cream */
  :root { --navy: #173a2a; --blue: #2f6b47; --gold: #d97706; --gold-l: #fbbf24; --tom: #c2410c; }
  .head2 { background: linear-gradient(160deg, #2f6b47, #173a2a); }
  .hero2 { height: 190px; background: radial-gradient(110% 90% at 85% 10%, rgba(251,191,36,.55) 0%, rgba(251,191,36,0) 50%), linear-gradient(165deg, #2f6b47 0%, #173a2a 80%); }
  .hero2::after { background: linear-gradient(transparent, rgba(23,58,42,.85)); height: 90px; }
  .hero2 .inner { bottom: 18px; }
  .hero2 h2 { font-size: 30px; }
  .hero2 .plate { position: absolute; right: 14px; top: 34px; font-size: 76px; opacity: .95; z-index: 1; }
  .open { display: inline-block; background: #16a34a; color: #fff; border-radius: 99px; padding: 3px 10px; font: 800 9px Nunito; letter-spacing: 1px; }
  .urlbar { margin: 10px 12px 0; font: 12px ui-monospace, monospace; background: #ebe6da; padding: 7px 10px; border-radius: 8px; color: #4a4435; }
  .cats2 { display: flex; gap: 6px; padding: 10px 12px 8px; }
  .cat { font: 800 11px Nunito; padding: 6px 12px; border-radius: 99px; background: #fff; color: var(--navy); border: 1.5px solid #e7e2d6; }
  .cat.on { background: var(--navy); color: #fff; border-color: var(--navy); }
  .menu { display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
  .food { background: #fff; border-radius: 16px; padding: 8px 10px; display: grid; grid-template-columns: 56px 1fr auto auto; gap: 0 10px; align-items: center; box-shadow: 0 4px 12px rgba(23,58,42,.07); transition: opacity .3s; }
  .food .ph { width: 56px; height: 56px; border-radius: 12px; display: grid; place-items: center; font-size: 30px; }
  .food b { display: block; font: 600 17px/1.1 Newsreader, serif; color: var(--ink2); }
  .food small { font: 11px Nunito; color: #7b8496; }
  .food .pr2 { font: 800 14px Nunito; color: var(--navy); }
  .food .add2 { width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: #2b2205; display: grid; place-items: center; font: 900 18px Nunito; transition: all .2s; }
  .food .add2.q { background: var(--navy); color: #fff; font-size: 15px; }
  .food.sold { opacity: .45; } .food.sold .add2 { background: #94a3b8; color: #fff; font-size: 8px; width: auto; padding: 0 8px; border-radius: 99px; }
  .cart2 { position: absolute; left: 12px; right: 12px; bottom: 68px; background: var(--navy); color: #fff; border-radius: 16px; padding: 13px 16px; display: flex; justify-content: space-between; font: 800 14px Nunito; transform: translateY(24px); opacity: 0; transition: transform .35s, opacity .25s; z-index: 5; box-shadow: 0 10px 24px rgba(0,0,0,.25); }
  .cart2.show { transform: none; opacity: 1; }
  .line { display: flex; justify-content: space-between; font: 15px Nunito; padding: 5px 0; color: var(--ink2); }
  .line.tot { font: 800 17px Nunito; border-top: 1.5px solid #e7e2d6; margin-top: 6px; padding-top: 9px; }
  .times { display: flex; gap: 8px; padding: 6px 12px 0; }
  .time2 { flex: 1; text-align: center; background: #fff; border: 1.5px solid #e7e2d6; border-radius: 12px; padding: 9px 2px; font: 800 13px Nunito; color: var(--ink2); transition: all .2s; }
  .time2 small { display: block; font: 600 9px Nunito; color: #7b8496; }
  .time2.sel { background: var(--navy); color: #fff; border-color: var(--navy); } .time2.sel small { color: #cfe3d6; }
  .time2.full { opacity: .4; text-decoration: line-through; }
  .tk { background: #fff; border-radius: 16px; padding: 11px 13px; box-shadow: 0 4px 12px rgba(23,58,42,.07); border-left: 5px solid #cbd5e1; transition: all .3s; }
  .tk.new { border-left-color: var(--tom); } .tk.cook { border-left-color: var(--gold); } .tk.ready { border-left-color: #16a34a; }
  .tk .top { display: flex; justify-content: space-between; align-items: center; }
  .tk b { font: 600 17px Newsreader, serif; } .tk .when { font: 800 10px Nunito; color: #7b8496; letter-spacing: .5px; }
  .tk p { font: 13px/1.35 Nunito; color: var(--ink2); margin-top: 3px; }
  .tk .nt2 { display: inline-block; margin-top: 5px; background: #fef3c7; color: #92400e; border-radius: 8px; padding: 3px 8px; font: 800 11px Nunito; }
  .st { font: 800 11px Nunito; border-radius: 99px; padding: 6px 12px; background: var(--tom); color: #fff; transition: all .2s; }
  .st.cook { background: var(--gold); color: #2b2205; } .st.ready { background: #16a34a; }
  .usual { margin: 12px; border-radius: 18px; padding: 16px; color: #fff; background: linear-gradient(150deg, #2f6b47, #173a2a); box-shadow: 0 8px 20px rgba(23,58,42,.25); }
  .usual small { font: 800 9px Nunito; letter-spacing: 1.5px; color: var(--gold-l); text-transform: uppercase; }
  .usual b { display: block; font: 600 22px/1.15 Newsreader, serif; margin: 4px 0 2px; }
  .usual p { font: 13px Nunito; opacity: .9; }
  .bars { padding: 2px 0 0; display: flex; flex-direction: column; gap: 9px; }
  .bar2 { display: grid; grid-template-columns: 96px 1fr 26px; gap: 8px; align-items: center; font: 700 12px Nunito; color: var(--ink2); }
  .bar2 i { display: block; height: 12px; border-radius: 99px; background: var(--gold); width: 0; transition: width 1s ease; }
  .bar2 i.low { background: #cbd5e1; }
  .day3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 12px 12px 0; }
  .day3 div { background: #fff; border-radius: 14px; padding: 10px; box-shadow: 0 4px 12px rgba(23,58,42,.07); text-align: center; }
  .day3 b { display: block; font: 600 26px/1 Newsreader, serif; color: var(--navy); } .day3 small { font: 700 10px Nunito; color: #7b8496; }
  .lockscreen { background: radial-gradient(120% 80% at 50% 0%, #3f7d58 0%, #173a2a 70%); }
  .notif .ap { background: var(--navy); font-size: 18px; }
  .toast { background: var(--navy); }
  .wk b { color: var(--navy); }
  #reflect { background: radial-gradient(120% 70% at 50% 20%, #2f6b47 0%, #173a2a 55%, #08140e 100%); }
  #reflect .rq em { color: var(--gold-l); }
  #reflect .big { font-size: 84px; }
  .vn { display: flex; align-items: center; gap: 10px; }
  .vn .play { width: 30px; height: 30px; border-radius: 50%; background: #2b6ce0; color: #fff; display: grid; place-items: center; font-size: 13px; }
  .vn .wave { flex: 1; height: 22px; width: 150px; border-radius: 4px; background: repeating-linear-gradient(90deg, #94a3b8 0 3px, transparent 3px 6px); }
  .vn .len { font-size: 12px; color: var(--muted); }
  .hero2 { height: 150px; } .hero2 .plate { font-size: 60px; top: 30px; } .hero2 h2 { font-size: 27px; }
  .food { padding: 6px 10px; } .food .ph { width: 46px; height: 46px; font-size: 25px; }
  .cats2 { padding: 8px 12px 6px; }
  .qrcard { margin: 12px; background: #fff; border-radius: 18px; padding: 16px; text-align: center; box-shadow: 0 6px 16px rgba(23,58,42,.1); }
  .qr { width: 150px; height: 150px; margin: 6px auto 10px; display: grid; grid-template-columns: repeat(15, 1fr); gap: 0; border: 8px solid #fff; outline: 2px solid var(--navy); border-radius: 6px; }
  .qr i { background: var(--navy); } .qr i.o { background: #fff; }
  .qrcard b { display: block; font: 600 19px Newsreader, serif; color: var(--ink2); } .qrcard small { font: 12px Nunito; color: #7b8496; }
  .sharerow { display: flex; gap: 8px; padding: 0 12px; }
  .sharerow span { flex: 1; text-align: center; background: #fff; border: 1.5px solid #e7e2d6; border-radius: 12px; padding: 10px 4px; font: 800 12px Nunito; color: var(--ink2); transition: all .2s; }
  .sharerow span.done { background: var(--navy); color: #fff; border-color: var(--navy); }
  .pausebar { margin: 12px 12px 0; background: #fff; border-radius: 14px; padding: 10px 12px; display: grid; grid-template-columns: 1fr auto; align-items: center; box-shadow: 0 4px 12px rgba(23,58,42,.07); }
  .pausebar b { font: 800 13px Nunito; color: var(--ink2); } .pausebar small { display: block; font: 11px Nunito; color: #7b8496; }
  .busy { display: none; margin: 10px 12px 0; background: #fef3c7; color: #92400e; border-radius: 12px; padding: 10px 12px; font: 800 13px Nunito; text-align: center; }
  .busy.show { display: block; }
"""

home_tab = ('<div class="tabbar"><span class="{a}"><svg viewBox="0 0 24 24"><path d="M5 4v7a3 3 0 0 0 6 0V4M8 4v16M17 4c-2 2-3 5-3 8h3v8"/></svg>Menu</span>'
            '<span class="{b}"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>Orders</span>'
            '<span class="{c}"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>Today</span>'
            '<span class=""><svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>More</span></div>')
tab = lambda on: home_tab.format(a="on" if on == "menu" else "", b="on" if on == "orders" else "", c="on" if on == "today" else "")

def food(fid, emoji, bg, name, desc, price, add_id=""):
    aid = f' id="{add_id}"' if add_id else ""
    return (f'<div class="food" id="{fid}"><span class="ph" style="background:{bg}">{emoji}</span><div><b>{name}</b><small>{desc}</small></div>'
            f'<span class="pr2">{price}</span><span class="add2"{aid}>+</span></div>')

menu = "\n        ".join([
    food("f-burger", "🍔", "#fde9d2", "Beef burger", "Cheese, onions, pickles", "11", "add-burger"),
    food("f-wrap", "🌯", "#e3f1dc", "Chicken wrap", "Grilled, spicy mayo", "9"),
    food("f-bowl", "🥗", "#dcefe6", "Veggie bowl", "Rice, beans, greens", "10"),
    food("f-fries", "🍟", "#fdf0c4", "Fries", "Hand-cut, salted", "4", "add-fries"),
])

body = f"""<div id="root">
<div id="cap"></div>
<div id="finger"></div>
<div id="mk" style="position:absolute;right:0;bottom:0;width:4px;height:4px;background:#000;z-index:99"></div>

<section id="hook" class="scene">
  <div class="emoji">🍔</div>
  <div class="big">Selling food?</div>
  <div class="big small">Watch what <em>one link</em> can do 👀</div>
</section>

<section id="pain" class="scene">
  <div class="wa-top"><div class="av">💬</div><div>Messages<small>23 unread · 4 missed calls</small></div></div>
  <div class="badge-count">41</div>
  <div class="chat" style="padding-top:190px">
    <div class="msg"><b>Ben T.</b><div class="vn"><span class="play">▶</span><span class="wave"></span><span class="len">0:48</span></div><div class="t">12:01</div></div>
    <div class="msg"><b>Nora K.</b>2 burgers no onions!! and a fries<div class="t">12:03</div></div>
    <div class="msg"><b>Ben T.</b><div class="vn"><span class="play">▶</span><span class="wave"></span><span class="len">1:12</span></div><div class="t">12:04</div></div>
    <div class="msg"><b>Missed call</b>📞 Lena P. (3)<div class="t">12:10</div></div>
    <div class="msg"><b>Sam W.</b>Is my food coming?? 40 mins 😤<div class="t">12:30</div></div>
    <div class="msg"><b>Nora K.</b>This has onions 😩<div class="t">12:52</div></div>
  </div>
  <div class="note">Ben – wrap? or 2 wraps??<br>Nora – <s>onions</s><br>Sam – where??<br>Lena – call back</div>
</section>

<section id="app" class="scene">
  <div class="phone"><div class="screen">

    <div class="view" id="v-menu">
      <div class="hero2">
        <span class="demo2">DEMO</span>
        <span class="plate">🍽️</span>
        <div class="inner">
          <span class="open">● OPEN NOW</span>
          <span class="welcome">ORDER FROM</span>
          <h2>Mo's Kitchen</h2>
          <p>moskitchen.app · sample data</p>
        </div>
      </div>
      <div class="busy" id="busy">⏸ Kitchen is full · ordering opens again at 13:15</div>
      <div class="cats2"><span class="cat on">Popular</span><span class="cat">Mains</span><span class="cat">Sides</span><span class="cat">Drinks</span></div>
      <div class="menu">
        {menu}
      </div>
      <div class="cart2" id="cart"><span id="cart-n">1 item</span><span id="cart-t">View order · 11</span></div>
      {tab('menu')}
    </div>

    <div class="view off" id="v-share">
      <div class="head2"><h1>Share your menu <span class="demo">DEMO</span></h1><p>One link, everywhere</p></div>
      <div class="qrcard"><div class="qr"><i></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i class="o"></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i></i><i></i><i class="o"></i><i></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i></i><i></i><i class="o"></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i><i></i><i></i><i class="o"></i><i></i><i></i><i></i><i></i><i class="o"></i><i class="o"></i><i></i><i></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i class="o"></i><i></i></div><b>Scan to order</b><small>moskitchen.app/menu · print it for the counter</small></div>
      <div class="sharerow"><span id="sh-1">Copy link</span><span id="sh-2">Share to status</span><span id="sh-3">Print QR</span></div>
      <div class="tip" style="margin-top:14px">It always shows today's menu and prices.</div>
    </div>

    <div class="view off" id="v-cart">
      <div class="head2"><p class="back">‹ Menu</p><h1>Your order <span class="demo">DEMO</span></h1><p>Mo's Kitchen</p></div>
      <div class="c2">
        <div class="line"><span>2 × Beef burger</span><span>22</span></div>
        <div class="line"><span>1 × Fries</span><span>4</span></div>
        <div class="line tot"><span>Total</span><span>26</span></div>
        <span class="lbl2" style="display:block;margin-top:10px">Note for the kitchen</span><div class="field" id="note"></div>
      </div>
      <div class="lbl2" style="padding:0 14px">Pickup time</div>
      <div class="times"><span class="time2 full">12:15<small>full</small></span><span class="time2" id="t-1230">12:30<small>2 left</small></span><span class="time2">12:45<small>free</small></span><span class="time2">13:00<small>free</small></span></div>
      <button class="btn2" id="b-send">Send order · pay on pickup</button>
    </div>

    <div class="view off" id="v-kitchen">
      <div class="head2"><h1>Orders <span class="demo">DEMO</span></h1><p>Kitchen screen · in the order they came in</p></div>
      <div class="pausebar"><div><b id="pause-b">Taking orders</b><small id="pause-s">Customers can order now</small></div><span class="switch" id="sw-pause"></span></div>
      <div class="sl">
        <div class="tk ready"><div class="top"><b>#22 · Sam W.</b><span class="st ready">Ready ✓</span></div><p>1 × Veggie bowl</p><span class="when">PICKUP 12:15</span></div>
        <div class="tk cook"><div class="top"><b>#23 · Ben T.</b><span class="st cook">Cooking</span></div><p>2 × Chicken wrap</p><span class="when">PICKUP 12:15</span></div>
        <div class="tk new" id="tk-24"><div class="top"><b>#24 · Nora K.</b><span class="st" id="st-24">New · start</span></div><p>2 × Beef burger · 1 × Fries</p><span class="nt2">📝 No onions on the burgers</span><br><span class="when">PICKUP 12:30 · TOTAL 26</span></div>
      </div>
      {tab('orders')}
    </div>

    <div class="view off" id="v-ready">
      <div class="lockscreen">
        <div class="time">12:28</div><div class="date">Nora's phone</div>
        <div class="notif show" style="position:relative;top:auto;left:auto;right:auto;margin:40px 14px 0"><span class="ap">🍔</span><b>Mo's Kitchen</b><span>Your order #24 is ready for pickup 🎉</span></div>
      </div>
    </div>

    <div class="view off" id="v-stock">
      <div class="head2"><h1>Today's menu <span class="demo">DEMO</span></h1><p>Switch off what has run out</p></div>
      <div class="sl">
        <div class="crow"><span class="avatar" style="background:#fde9d2;font-size:20px">🍔</span><b>Beef burger</b><span class="switch"></span><small>Available</small></div>
        <div class="crow"><span class="avatar" style="background:#e3f1dc;font-size:20px">🌯</span><b>Chicken wrap</b><span class="switch"></span><small>Available</small></div>
        <div class="crow"><span class="avatar" style="background:#dcefe6;font-size:20px">🥗</span><b>Veggie bowl</b><span class="switch" id="sw-bowl"></span><small id="bowl-s">Only 1 left</small></div>
        <div class="crow"><span class="avatar" style="background:#fdf0c4;font-size:20px">🍟</span><b>Fries</b><span class="switch"></span><small>Available</small></div>
      </div>
      <div class="tip">Hidden items come back tomorrow, by themselves.</div>
    </div>

    <div class="view off" id="v-regular">
      <div class="head2"><h1>Welcome back, Nora <span class="demo">DEMO</span></h1><p>Mo's Kitchen · your 6th order</p></div>
      <div class="usual"><small>Your usual</small><b>2 × Beef burger, 1 × Fries</b><p>No onions · total 26</p></div>
      <button class="btn2 goldb" id="b-again">Order again</button>
      <div class="tip" style="margin-top:14px">Or browse the menu for something new.</div>
    </div>

    <div class="view off" id="v-day">
      <div class="head2"><h1>Today <span class="demo">DEMO</span></h1><p>Example day · sample data</p></div>
      <div class="day3"><div><b>46</b><small>orders</small></div><div><b>0</b><small>missed</small></div><div><b>612</b><small>taken today</small></div></div>
      <div class="c2"><span class="lbl2">What sold</span>
        <div class="bars" style="margin-top:10px">
          <div class="bar2"><span>Beef burger</span><i data-w="100"></i><span>31</span></div>
          <div class="bar2"><span>Fries</span><i data-w="84"></i><span>26</span></div>
          <div class="bar2"><span>Chicken wrap</span><i data-w="58"></i><span>18</span></div>
          <div class="bar2"><span>Veggie bowl</span><i data-w="39"></i><span>12</span></div>
          <div class="bar2"><span>Fish pie</span><i class="low" data-w="6"></i><span>2</span></div>
        </div>
      </div>
      <div class="tip">Cook more burgers tomorrow. Rethink the fish pie.</div>
      {tab('today')}
    </div>

    <div class="view off" id="v-add">
      <div class="head2"><h1>This week <span class="demo">DEMO</span></h1><p>Example week · sample data</p></div>
      <div class="wk">
        <div><b>0</b><small>missed orders</small></div>
        <div><b>0</b><small>wrong orders</small></div>
        <div><b>0</b><small>voice notes to replay</small></div>
        <div><b>214</b><small>orders, all clear</small></div>
        <div><b>38</b><small>regulars ordered again</small></div>
        <div><b>11 hrs</b><small>off the phone</small></div>
      </div>
      <div class="heart" id="heart">Back to the food.</div>
    </div>

    <div class="toast" id="toast"></div>
  </div></div>
</section>

<section id="reflect" class="scene">
  <div class="big">👩‍🍳</div>
  <div class="rq">You started this because you love to <em>cook</em>,<br>not to answer messages.</div>
  <div class="rs">Let the app take the orders.<br>You get back to the food.</div>
</section>

{cta}

</div>
"""

js = """
  window.addFood = (id, n, t) => { const a = $(id); a.textContent = n; a.classList.add("q"); $("#cart").classList.add("show"); $("#cart-n").textContent = t[0]; $("#cart-t").textContent = t[1]; };
  window.clearCart = () => { $("#cart").classList.remove("show"); for (const id of ["#add-burger", "#add-fries"]) { const b = $(id); b.textContent = "+"; b.classList.remove("q"); } };
  window.pickTime = () => $("#t-1230").classList.add("sel");
  window.setStatus = (cls, label) => { const s = $("#st-24"), t = $("#tk-24"); s.className = "st " + cls; s.textContent = label; t.className = "tk " + (cls || "new"); };
  window.bowlOut = () => { $("#sw-bowl").classList.add("off"); $("#bowl-s").textContent = "Sold out today"; const f = $("#f-bowl"); f.classList.add("sold"); f.querySelector(".add2").textContent = "SOLD OUT"; $("#cart").classList.remove("show"); for (const id of ["#add-burger", "#add-fries"]) { const b = $(id); b.textContent = "+"; b.classList.remove("q"); } };
  window.shared = (id, label) => { const b = $(id); b.classList.add("done"); b.textContent = label; };
  window.pauseOrders = () => { $("#sw-pause").classList.add("off"); $("#pause-b").textContent = "Paused until 13:15"; $("#pause-s").textContent = "Customers see when you are back"; $("#busy").classList.add("show"); };
  window.resumeOrders = () => { $("#sw-pause").classList.remove("off"); $("#pause-b").textContent = "Taking orders"; $("#pause-s").textContent = "Customers can order now"; $("#busy").classList.remove("show"); };
  window.again = () => { const b = $("#b-again"); b.textContent = "✓ Ordered · pickup 12:45"; b.style.background = "#16a34a"; b.style.color = "#fff"; };
  window.bars = () => document.querySelectorAll(".bar2 i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
"""

out = head + css + "</style>\n</head>\n<body>\n" + body + script + js + "</script>\n</body>\n</html>\n"
open(f"{base}/videos/06-food-full/stage.html", "w").write(out)
print("ok")
