"""Builds stage.html for the barber video from the polished church stage. Run from marketing/tiktok: python3 videos/07-barber-full/build_stage.py "$PWD"."""
import sys, random

base = sys.argv[1]
src = open(f"{base}/videos/05-church-full/stage.html").read()
head = src[:src.index("</style>")]
cta = src[src.index('<section id="cta"'):src.index("</section>", src.index('<section id="cta"')) + 10]
cta = cta.replace("Want this for <em>your</em> church or business?", "Want this for <em>your</em> business?")
script = src[src.index("<script>"):src.index("</script>")]
head = head.replace("<title>New Dawn Chapel full demo video</title>", "<title>Corner Chair Barbers full demo video</title>")

css = """
  /* Corner Chair Barbers: charcoal and copper on warm cream */
  :root { --navy: #211c18; --blue: #3a322c; --gold: #c27a2c; --gold-l: #f0b878; --cream: #f5f1ea; --ink2: #2a2420; }
  .head2 { background: linear-gradient(160deg, #3a322c, #211c18); }
  .head2 .back, .head2 h1 { }
  .hero2 { height: 170px; background: radial-gradient(110% 90% at 85% 10%, rgba(240,184,120,.55) 0%, rgba(240,184,120,0) 50%), linear-gradient(165deg, #4a3f36 0%, #211c18 80%); }
  .hero2::after { background: linear-gradient(transparent, rgba(33,28,24,.85)); height: 90px; }
  .hero2 .inner { bottom: 16px; } .hero2 h2 { font-size: 28px; }
  .hero2 .plate { position: absolute; right: 14px; top: 34px; font-size: 64px; z-index: 1; }
  .open { display: inline-block; background: #16a34a; color: #fff; border-radius: 99px; padding: 3px 10px; font: 800 9px Nunito; letter-spacing: 1px; }
  .svc { background: #fff; border: 2px solid transparent; border-radius: 16px; padding: 10px 12px; display: grid; grid-template-columns: 44px 1fr auto; gap: 0 10px; align-items: center; box-shadow: 0 4px 12px rgba(33,28,24,.07); transition: all .2s; }
  .svc .ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 24px; background: #f3e6d4; grid-row: span 2; }
  .svc b { font: 600 17px/1.1 Newsreader, serif; color: var(--ink2); } .svc small { font: 11px Nunito; color: #7b8496; }
  .svc .pr2 { font: 800 15px Nunito; color: var(--navy); grid-row: span 2; }
  .svc.sel { border-color: var(--gold); background: #fff8ee; }
  .svlist { display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
  .bchips { display: flex; gap: 10px; padding: 4px 12px 0; }
  .bch { flex: 1; text-align: center; background: #fff; border: 2px solid transparent; border-radius: 16px; padding: 10px 4px; box-shadow: 0 4px 12px rgba(33,28,24,.07); transition: all .2s; }
  .bch i { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 auto 4px; border-radius: 50%; font: 800 17px Nunito; color: #fff; font-style: normal; }
  .bch b { display: block; font: 800 13px Nunito; color: var(--ink2); } .bch small { font: 600 10px Nunito; color: #7b8496; }
  .bch.sel { border-color: var(--gold); background: #fff8ee; }
  .days { display: flex; gap: 8px; padding: 10px 12px 0; }
  .dayc { flex: 1; text-align: center; background: #fff; border-radius: 14px; padding: 8px 2px; font: 800 14px Nunito; color: var(--ink2); box-shadow: 0 4px 12px rgba(33,28,24,.07); }
  .dayc small { display: block; font: 700 10px Nunito; color: #7b8496; } .dayc.sel { background: var(--navy); color: #fff; } .dayc.sel small { color: var(--gold-l); }
  .slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 12px 0; }
  .slot { text-align: center; background: #fff; border: 2px solid #e7e2d6; border-radius: 12px; padding: 11px 2px; font: 800 14px Nunito; color: var(--ink2); transition: all .2s; }
  .slot.taken { background: #efeae0; border-color: transparent; color: #b6ad9d; text-decoration: line-through; }
  .slot.sel { background: var(--navy); color: #fff; border-color: var(--navy); }
  .summary { margin: 12px 12px 0; background: #fff; border-radius: 16px; padding: 12px 14px; box-shadow: 0 4px 12px rgba(33,28,24,.07); font: 14px/1.5 Nunito; color: var(--ink2); }
  .summary b { font: 600 18px Newsreader, serif; }
  .okcard { margin: 18px 12px 0; text-align: center; background: #fff; border-radius: 20px; padding: 22px 16px; box-shadow: 0 6px 16px rgba(33,28,24,.1); }
  .okcard .tick { width: 58px; height: 58px; margin: 0 auto 8px; border-radius: 50%; background: #16a34a; color: #fff; display: grid; place-items: center; font-size: 30px; }
  .okcard b { display: block; font: 600 24px Newsreader, serif; color: var(--ink2); } .okcard p { font: 14px/1.5 Nunito; color: #5b6476; margin-top: 4px; }
  .lockscreen { background: radial-gradient(120% 80% at 50% 0%, #5a4a3c 0%, #211c18 70%); }
  .notif .ap { background: var(--navy); font-size: 18px; }
  .toast { background: var(--navy); border-left: 4px solid var(--gold); }
  .tk { background: #fff; border-radius: 16px; padding: 10px 13px; box-shadow: 0 4px 12px rgba(33,28,24,.07); border-left: 5px solid #cbd5e1; display: grid; grid-template-columns: 52px 1fr auto; gap: 0 10px; align-items: center; transition: all .3s; }
  .tk .tm { font: 800 13px Nunito; color: var(--navy); grid-row: span 2; }
  .tk b { font: 600 17px/1.1 Newsreader, serif; color: var(--ink2); } .tk p { font: 12px Nunito; color: #7b8496; }
  .tk.done { border-left-color: #16a34a; } .tk.chair { border-left-color: var(--gold); } .tk.next { border-left-color: var(--navy); }
  .tk.open { background: transparent; border: 2px dashed #cbb99f; box-shadow: none; border-left: 2px dashed #cbb99f; }
  .tk.filled { border-left-color: #16a34a; }
  .st { font: 800 11px Nunito; border-radius: 99px; padding: 6px 11px; background: var(--navy); color: #fff; grid-row: span 2; transition: all .2s; }
  .st.done { background: #16a34a; } .st.chair { background: var(--gold); color: #2b2205; } .st.arr { background: var(--gold); color: #2b2205; } .st.soft { background: #e7e2d6; color: #5b6476; } .st.red { background: #fee2e2; color: #b91c1c; }
  .gap { text-align: center; font: italic 13px Newsreader, serif; color: #8a7f6c; padding: 2px 0; }
  .usual { margin: 12px; border-radius: 18px; padding: 16px; color: #fff; background: linear-gradient(150deg, #4a3f36, #211c18); box-shadow: 0 8px 20px rgba(33,28,24,.25); }
  .usual small { font: 800 9px Nunito; letter-spacing: 1.5px; color: var(--gold-l); text-transform: uppercase; }
  .usual b { display: block; font: 600 22px/1.15 Newsreader, serif; margin: 4px 0 2px; } .usual p { font: 13px Nunito; opacity: .9; }
  .bars { padding: 2px 0 0; display: flex; flex-direction: column; gap: 9px; }
  .bar2 { display: grid; grid-template-columns: 70px 1fr 28px; gap: 8px; align-items: center; font: 700 12px Nunito; color: var(--ink2); }
  .bar2 i { display: block; height: 12px; border-radius: 99px; background: var(--gold); width: 0; transition: width 1s ease; } .bar2 i.low { background: #cbd5e1; }
  .day3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 12px 12px 0; }
  .day3 div { background: #fff; border-radius: 14px; padding: 10px; box-shadow: 0 4px 12px rgba(33,28,24,.07); text-align: center; }
  .day3 b { display: block; font: 600 26px/1 Newsreader, serif; color: var(--navy); } .day3 small { font: 700 10px Nunito; color: #7b8496; }
  .wk b { color: var(--navy); }
  #reflect { background: radial-gradient(120% 70% at 50% 20%, #5a4a3c 0%, #211c18 55%, #0b0907 100%); }
  #reflect .rq em { color: var(--gold-l); } #reflect .big { font-size: 84px; }
  .vn { display: flex; align-items: center; gap: 10px; }
  .qrcard { margin: 12px; background: #fff; border-radius: 18px; padding: 16px; text-align: center; box-shadow: 0 6px 16px rgba(33,28,24,.1); }
  .qr { width: 150px; height: 150px; margin: 6px auto 10px; display: grid; grid-template-columns: repeat(15, 1fr); border: 8px solid #fff; outline: 2px solid var(--navy); border-radius: 6px; }
  .qr i { background: var(--navy); } .qr i.o { background: #fff; }
  .qrcard b { display: block; font: 600 19px Newsreader, serif; color: var(--ink2); } .qrcard small { font: 12px Nunito; color: #7b8496; }
  .sharerow { display: flex; gap: 8px; padding: 0 12px; }
  .sharerow span { flex: 1; text-align: center; background: #fff; border: 1.5px solid #e7e2d6; border-radius: 12px; padding: 10px 4px; font: 800 12px Nunito; color: var(--ink2); transition: all .2s; }
  .sharerow span.done { background: var(--navy); color: #fff; border-color: var(--navy); }
  .lbl2 { color: var(--gold); }
  .heart { color: var(--navy); }
"""

random.seed(5)
def qr():
    cells = []
    for r in range(15):
        for c in range(15):
            fin = (r < 5 and c < 5) or (r < 5 and c > 9) or (r > 9 and c < 5)
            ring = fin and (r in (0, 4, 10, 14) or c in (0, 4, 10, 14) or (r < 5 and c > 9 and (c in (10, 14))) or False)
            if fin:
                rr, cc = (r % 10 if r > 9 else r), (c - 10 if c > 9 else c)
                dark = rr in (0, 4) or cc in (0, 4) or (1 < rr < 3 and 1 < cc < 3) or (rr == 2 and cc == 2)
                cells.append("<i></i>" if dark else '<i class="o"></i>')
            else:
                cells.append("<i></i>" if random.random() < .5 else '<i class="o"></i>')
    return "".join(cells)

home_tab = ('<div class="tabbar" style="grid-template-columns:repeat(4,1fr)">'
            '<span class="{a}"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>Book</span>'
            '<span class="{b}"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>Today</span>'
            '<span class="{c}"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>Stats</span>'
            '<span class=""><svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>More</span></div>')
tab = lambda on: home_tab.format(a="on" if on == "book" else "", b="on" if on == "day" else "", c="on" if on == "stats" else "")

def svc(sid, emoji, name, desc, price):
    return f'<div class="svc" id="{sid}"><span class="ic">{emoji}</span><b>{name}</b><span class="pr2">{price}</span><small>{desc}</small></div>'

services = "\n        ".join([
    svc("svc-cut", "✂️", "Haircut", "30 min · scissors or clippers", "14"),
    svc("svc-fade", "💈", "Skin fade", "40 min · with a clean finish", "18"),
    svc("svc-beard", "🧔", "Beard trim", "20 min · shape and line up", "8"),
    svc("svc-combo", "⭐", "Fade + beard", "55 min · the full works", "24"),
])

body = f"""<div id="root">
<div id="cap"></div>
<div id="finger"></div>
<div id="mk" style="position:absolute;right:0;bottom:0;width:4px;height:4px;background:#000;z-index:99"></div>

<section id="hook" class="scene">
  <div class="emoji">💈</div>
  <div class="big">One link ends<br><em>booking chaos</em></div>
  <div class="big small">for barbers and salons 👀</div>
</section>

<section id="pain" class="scene">
  <div class="wa-top"><div class="av">💬</div><div>Messages<small>19 unread · 3 missed calls</small></div></div>
  <div class="badge-count">34</div>
  <div class="chat" style="padding-top:190px">
    <div class="msg"><b>Dan R.</b>Are you free at 3?<div class="t">11:02</div></div>
    <div class="msg"><b>Leo M.</b>Can you fit me in today?? 🙏<div class="t">11:05</div></div>
    <div class="msg"><b>Sam T.</b>Running 20 mins late sorry<div class="t">12:40</div></div>
    <div class="msg"><b>Missed call</b>📞 Jay K. (2)<div class="t">13:10</div></div>
    <div class="msg"><b>Dan R.</b>Hello?? Did you see my message<div class="t">13:48</div></div>
    <div class="msg"><b>Leo M.</b>I'm outside, where are you 😅<div class="t">14:55</div></div>
  </div>
  <div class="note">3pm – Dan?? Leo??<br>Sam – <s>late</s><br>Jay – no show<br>Who's next??</div>
</section>

<section id="app" class="scene">
  <div class="phone"><div class="screen">

    <div class="view" id="v-book">
      <div class="hero2">
        <span class="demo2">DEMO</span>
        <span class="plate">💈</span>
        <div class="inner">
          <span class="open">● BOOKING OPEN</span>
          <span class="welcome">BOOK AT</span>
          <h2>Corner Chair Barbers</h2>
          <p>cornerchair.app · sample data</p>
        </div>
      </div>
      <div class="lbl2" style="padding:12px 14px 6px">Services</div>
      <div class="svlist">
        {services}
      </div>
      {tab('book')}
    </div>

    <div class="view off" id="v-share">
      <div class="head2"><h1>Share your link <span class="demo">DEMO</span></h1><p>One link, everywhere</p></div>
      <div class="qrcard"><div class="qr">{qr()}</div><b>Scan to book</b><small>cornerchair.app/book · put it on a card at the chair</small></div>
      <div class="sharerow"><span id="sh-1">Copy link</span><span id="sh-2">Share to status</span><span id="sh-3">Print card</span></div>
      <div class="tip" style="margin-top:14px">Open for bookings day and night.</div>
    </div>

    <div class="view off" id="v-pick">
      <div class="head2"><p class="back">‹ Corner Chair Barbers</p><h1>Choose your cut <span class="demo">DEMO</span></h1><p>Step 1 of 3</p></div>
      <div class="lbl2" style="padding:12px 14px 6px">Service</div>
      <div class="svlist">
        {services.replace('id="svc-fade"', 'id="svc-fade-p"').replace('id="svc-cut"', 'id="svc-cut-p"').replace('id="svc-beard"', 'id="svc-beard-p"').replace('id="svc-combo"', 'id="svc-combo-p"')}
      </div>
      <div class="lbl2" style="padding:12px 14px 6px">Barber</div>
      <div class="bchips">
        <div class="bch" id="bar-jo"><i style="background:#c27a2c">J</i><b>Jo</b><small>Fades</small></div>
        <div class="bch"><i style="background:#3a322c">K</i><b>Kai</b><small>Beards</small></div>
        <div class="bch"><i style="background:#7a5c3a">R</i><b>Rae</b><small>Any cut</small></div>
      </div>
    </div>

    <div class="view off" id="v-time">
      <div class="head2"><p class="back">‹ Back</p><h1>Pick a time <span class="demo">DEMO</span></h1><p>Skin fade with Jo · 40 min</p></div>
      <div class="days"><div class="dayc">Fri<small>14</small></div><div class="dayc sel">Sat<small>15</small></div><div class="dayc">Mon<small>17</small></div><div class="dayc">Tue<small>18</small></div></div>
      <div class="slots">
        <div class="slot taken">10:00</div><div class="slot">10:40</div><div class="slot taken">11:20</div>
        <div class="slot">12:00</div><div class="slot taken">12:40</div><div class="slot">13:20</div>
        <div class="slot taken">14:00</div><div class="slot" id="slot-1430">14:30</div><div class="slot">15:10</div>
      </div>
      <div class="summary" id="sum" style="opacity:0;transition:opacity .3s"><b>Skin fade with Jo</b><br>Saturday 15 · 14:30 · 18</div>
      <button class="btn2" id="b-book">Book this time</button>
    </div>

    <div class="view off" id="v-done">
      <div class="head2"><h1>Confirmed <span class="demo">DEMO</span></h1><p>Corner Chair Barbers</p></div>
      <div class="okcard"><div class="tick">✓</div><b>You're booked</b><p>Skin fade with Jo<br>Saturday 15 · 14:30</p></div>
      <button class="btn2 goldb">Add to calendar</button>
      <div class="tip" style="margin-top:14px">We'll remind you before your visit.</div>
    </div>

    <div class="view off" id="v-remind">
      <div class="lockscreen">
        <div class="time">13:30</div><div class="date">Dan's phone</div>
        <div class="notif show" style="position:relative;top:auto;left:auto;right:auto;margin:40px 14px 0"><span class="ap">💈</span><b>Corner Chair Barbers</b><span>Reminder: your fade with Jo is in 1 hour (14:30). Tap to confirm or change.</span></div>
        <div class="notif" id="remind-n" style="position:relative;top:auto;left:auto;right:auto;margin:12px 14px 0"><span class="ap">💈</span><b>Corner Chair Barbers</b><span>✓ Thanks Dan, see you at 14:30!</span></div>
      </div>
    </div>

    <div class="view off" id="v-day">
      <div class="head2"><h1>Saturday <span class="demo">DEMO</span></h1><p>Your day · Jo · sample data</p></div>
      <div class="sl" style="gap:8px">
        <div class="tk done"><span class="tm">13:00</span><b>Sam T.</b><span class="st done">Done ✓</span><p>Haircut</p></div>
        <div class="tk chair"><span class="tm">13:40</span><b>Leo M.</b><span class="st chair">In the chair</span><p>Beard trim</p></div>
        <div class="tk next" id="tk-dan"><span class="tm">14:30</span><b>Dan R.</b><span class="st" id="st-dan">Booked</span><p>Skin fade</p></div>
        <div class="tk next" id="tk-jay"><span class="tm">15:20</span><b id="jay-n">Jay K.</b><span class="st" id="st-jay">Booked</span><p id="jay-p">Fade + beard</p></div>
        <div class="gap">16:20 · free</div>
      </div>
      {tab('day')}
    </div>

    <div class="view off" id="v-regular">
      <div class="head2"><h1>Welcome back, Dan <span class="demo">DEMO</span></h1><p>Corner Chair Barbers · your 9th visit</p></div>
      <div class="usual"><small>Your usual</small><b>Skin fade with Jo</b><p>Every 3 weeks · next free: Sat 11:00</p></div>
      <button class="btn2 goldb" id="b-again">Book again</button>
      <div class="tip" style="margin-top:14px">Or pick a different cut or barber.</div>
    </div>

    <div class="view off" id="v-stats">
      <div class="head2"><h1>This week <span class="demo">DEMO</span></h1><p>Example week · sample data</p></div>
      <div class="day3"><div><b>63</b><small>cuts</small></div><div><b>2</b><small>no-shows</small></div><div><b>71%</b><small>rebooked</small></div></div>
      <div class="c2" style="margin:12px;background:#fff;border-radius:16px;padding:14px;box-shadow:0 6px 16px rgba(33,28,24,.08)"><span class="lbl2">Busiest days</span>
        <div class="bars" style="margin-top:10px">
          <div class="bar2"><span>Saturday</span><i data-w="100"></i><span>19</span></div>
          <div class="bar2"><span>Friday</span><i data-w="78"></i><span>15</span></div>
          <div class="bar2"><span>Thursday</span><i data-w="58"></i><span>11</span></div>
          <div class="bar2"><span>Wednesday</span><i data-w="36"></i><span>7</span></div>
          <div class="bar2"><span>Tuesday</span><i class="low" data-w="20"></i><span>4</span></div>
        </div>
      </div>
      <div class="tip">Open longer on Saturday. Tuesday is quiet.</div>
      {tab('stats')}
    </div>

    <div class="view off" id="v-add">
      <div class="head2"><h1>This week <span class="demo">DEMO</span></h1><p>Example week · sample data</p></div>
      <div class="wk">
        <div><b>0</b><small>double bookings</small></div>
        <div><b>0</b><small>"are you free?" messages</small></div>
        <div><b>2</b><small>no-shows (was 9)</small></div>
        <div><b>63</b><small>cuts, all booked</small></div>
        <div><b>45</b><small>regulars rebooked</small></div>
        <div><b>9 hrs</b><small>off the phone</small></div>
      </div>
      <div class="heart" id="heart">Back to the chair.</div>
    </div>

    <div class="toast" id="toast"></div>
  </div></div>
</section>

<section id="reflect" class="scene">
  <div class="big">💈</div>
  <div class="rq">You became a barber to make people look <em>sharp</em>,<br>not to chase messages.</div>
  <div class="rs">Let the app run the diary.<br>You get back to the chair.</div>
</section>

{cta}

</div>
"""

js = """
  window.pickSvc = () => $("#svc-fade-p").classList.add("sel");
  window.pickBarber = () => $("#bar-jo").classList.add("sel");
  window.pickSlot = () => { $("#slot-1430").classList.add("sel"); $("#sum").style.opacity = 1; };
  window.setDan = (cls, label) => { const s = $("#st-dan"), t = $("#tk-dan"); s.className = "st " + cls; s.textContent = label; t.className = "tk " + (cls === "done" ? "done" : "chair"); };
  window.cancelJay = () => { $("#st-jay").className = "st red"; $("#st-jay").textContent = "Cancelled"; $("#jay-p").textContent = "Cancelled by customer · slot reopened"; $("#tk-jay").className = "tk open"; };
  window.fillJay = () => { $("#jay-n").textContent = "Mia B."; $("#jay-p").textContent = "Haircut · booked just now"; $("#st-jay").className = "st done"; $("#st-jay").textContent = "Booked ✓"; $("#tk-jay").className = "tk filled"; };
  window.shared = (id, label) => { const b = $(id); b.classList.add("done"); b.textContent = label; };
  window.again = () => { const b = $("#b-again"); b.textContent = "✓ Booked · Sat 11:00 with Jo"; b.style.background = "#16a34a"; b.style.color = "#fff"; };
  window.bars = () => document.querySelectorAll(".bar2 i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
"""

out = head + css + "</style>\n</head>\n<body>\n" + body + script + js + "</script>\n</body>\n</html>\n"
open(f"{base}/videos/07-barber-full/stage.html", "w").write(out)
print("ok")
