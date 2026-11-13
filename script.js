'use strict';
// ---- CONFIG ----
// 2084/03/21 B.S. (Asar 21, 2084) ≈ 5 July 2027. Nepali months vary by year, so VERIFY this against an official
// patro and adjust if needed. Time is Nepal (+05:45).
const TARGET = new Date('2027-07-05T00:00:00+05:45');
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let run = 0;

// ---- starfield ----
const bg = $('#bg'), bx = bg.getContext('2d'); let stars = [];
function size(c){ c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; }
function initStars(){ size(bg); size(fx); stars = Array.from({length: 160}, () => ({x: Math.random(), y: Math.random(), r: Math.random()*1.4+.3, p: Math.random()*6, s: Math.random()*1.5+.5})); }
const fx = $('#fx'), fc = fx.getContext('2d'); let parts = [];
addEventListener('resize', initStars); initStars();

// ---- fireworks + confetti ----
function burst(x, y){
  const n = 70, hue = Math.random() < .5 ? 45 : 50;
  for (let i = 0; i < n; i++){ const a = Math.PI*2*i/n, v = Math.random()*4+2;
    parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 1, d: .012+Math.random()*.01, c: Math.random()<.3 ? '#fff' : `hsl(${hue},85%,${60+Math.random()*20}%)`, g: .035, r: 2}); }
}
function confetti(n = 120){
  for (let i = 0; i < n; i++) parts.push({x: Math.random()*fx.width, y: -20*Math.random(), vx: (Math.random()-.5)*2, vy: Math.random()*2+1.5, life: 1, d: .003, c: Math.random()<.7 ? '#f2d78e' : '#fff', g: 0, r: 3+Math.random()*3, sq: 1});
}
let fwTimer = 0; const fireworks = on => { clearInterval(fwTimer); if (on) fwTimer = setInterval(() => burst(Math.random()*fx.width*.8+fx.width*.1, Math.random()*fx.height*.5+fx.height*.1), 500); };

function frame(t){
  bx.clearRect(0,0,bg.width,bg.height);
  const g = bx.createLinearGradient(0,0,0,bg.height); g.addColorStop(0,'#030614'); g.addColorStop(1,'#0c1a40');
  bx.fillStyle = g; bx.fillRect(0,0,bg.width,bg.height);
  for (const s of stars){ bx.globalAlpha = .4+.6*Math.abs(Math.sin(t/1000*s.s+s.p)); bx.fillStyle = '#fff6d8';
    bx.beginPath(); bx.arc(s.x*bg.width, s.y*bg.height, s.r*devicePixelRatio, 0, 7); bx.fill(); }
  bx.globalAlpha = 1;
  fc.clearRect(0,0,fx.width,fx.height);
  parts = parts.filter(p => p.life > 0 && p.y < fx.height + 30);
  for (const p of parts){ p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.d; fc.globalAlpha = Math.max(p.life,0); fc.fillStyle = p.c;
    p.sq ? fc.fillRect(p.x, p.y, p.r*devicePixelRatio, p.r*1.6*devicePixelRatio) : (fc.beginPath(), fc.arc(p.x,p.y,p.r*devicePixelRatio,0,7), fc.fill()); }
  fc.globalAlpha = 1; requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- cake build ----
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
(function buildCake(){
  const cg = $('#candles'), pos = [];
  for (let i = 0; i < 7; i++) pos.push([142 + i*19.3, 172]);
  for (let i = 0; i < 6; i++){ pos.push([58 + i*13, 252]); pos.push([284 + i*13 + 0, 252]); }
  pos.forEach(([x,y], i) => { const g = el('g', {}, cg); el('rect', {class:'candle', x:x-3, y:y-30, width:6, height:30, rx:1.5}, g);
    const f = el('ellipse', {class:'flame', cx:x, cy:y-39, rx:4.5, ry:9}, g); f.style.animationDelay = (i*.07)+'s'; });
  const d = $('#deco'); // delicate gold floral accents
  [[70,270],[110,282],[290,282],[330,270],[200,282],[155,238],[245,238],[200,200]].forEach(([x,y]) => {
    for (let k = 0; k < 5; k++){ const a = k*1.2566; el('circle', {cx:x+Math.cos(a)*5, cy:y+Math.sin(a)*5, r:3.4, opacity:.9}, d); }
    el('circle', {cx:x, cy:y, r:2.6, fill:'#fff'}, d); });
})();

// ---- music (soft synth, optional) ----
let ac, musicOn = false, mTimer;
const NOTES = [[262,.75],[262,.25],[294,1],[262,1],[349,1],[330,2],[262,.75],[262,.25],[294,1],[262,1],[392,1],[349,2],[262,.75],[262,.25],[523,1],[440,1],[349,1],[330,1],[294,2],[466,.75],[466,.25],[440,1],[349,1],[392,1],[349,2]];
function playTune(){
  if (!musicOn) return; let t = ac.currentTime + .1;
  for (const [f,d] of NOTES){ const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.06,t+.05); g.gain.exponentialRampToValueAtTime(.0001,t+d*.55);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t+d*.6); t += d*.55; }
  mTimer = setTimeout(playTune, (t - ac.currentTime + 4)*1000);
}
$('#music').onclick = e => { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); musicOn = !musicOn; clearTimeout(mTimer);
  e.target.textContent = musicOn ? '♪ Music on' : '♪ Music off'; if (musicOn) { ac.resume(); playTune(); } };

// ---- scene helpers ----
function scene(id){ $$('.scene').forEach(s => s.classList.toggle('on', s.id === id)); }
async function say(el, text, hold = 2600){ el.textContent = text; el.classList.add('show'); await sleep(1600 + hold); el.classList.remove('show'); await sleep(1400); }
const glow = v => $('#glow').style.opacity = v;

// ---- gate & countdown ----
function tick(){
  const ms = TARGET - Date.now(), open = $('#open');
  if (ms <= 0){ $('#count').textContent = 'It\u2019s her day! 🎂'; open.disabled = false; open.textContent = 'Open your surprise'; return; }
  const d = Math.floor(ms/864e5), h = Math.floor(ms/36e5)%24, m = Math.floor(ms/6e4)%60, s = Math.floor(ms/1e3)%60;
  $('#count').textContent = `${d}d ${h}h ${m}m ${s}s until 2084/03/21 B.S.`;
}
tick(); setInterval(tick, 1000);
$('#open').onclick = start; $('#preview').onclick = start;
if (new URLSearchParams(location.search).has('preview')) $('#preview').click?.();

// ---- main experience ----
async function start(){
  const id = ++run; const live = () => id === run;
  if (!musicOn) $('#music').click();
  $$('.line').forEach(l => l.classList.remove('show')); $$('#final .f3,#final .f4').forEach(x => x.classList.remove('show'));
  $$('.candle,.flame').forEach(f => f.classList.remove('out')); $('#wishUI').classList.remove('show'); $('#msgBox').innerHTML = '';
  document.body.classList.remove('dark'); fireworks(false);
  // Scene 1
  scene('text'); const L = $('#line'); await sleep(1500); glow(.6);
  for (const t of ['Today isn\u2019t just another day...', 'Because someone truly special was born on this day.', 'Her name is...']) { await say(L, t); if (!live()) return; }
  L.className = 'line gold big'; L.style.maxWidth = 'none'; L.textContent = 'BABE'; L.classList.add('show'); burst(fx.width/2, fx.height/2); await sleep(4200); L.classList.remove('show'); await sleep(1500);
  L.className = 'line'; L.style.maxWidth = ''; if (!live()) return;
  // Scene 2
  scene('cakeScene'); await sleep(3000); if (!live()) return;
  scene('cakeScene'); // caption
  scene('text'); await say(L, 'A little surprise for you, babe...', 1500); if (!live()) return;
  // Scene 3
  scene('text'); await say(L, 'MAKE A WISH', 1500); await say(L, 'Close your eyes, babe...', 1500); await say(L, 'Think of something your heart truly wishes for.', 2000); if (!live()) return;
  scene('cakeScene'); await sleep(800); $('#wishUI').classList.add('show');
  await wish(); if (!live()) return;
  // Scene 4
  $$('.flame').forEach((f,i) => setTimeout(() => f.classList.add('out'), i*60)); $('#wishUI').classList.remove('show'); glow(0); document.body.classList.add('dark');
  await sleep(2500); if (!live()) return; document.body.classList.remove('dark');
  scene('reveal'); fireworks(true); confetti(160); setTimeout(() => confetti(120), 3000); setTimeout(() => confetti(120), 6000); await sleep(10000); if (!live()) return;
  fireworks(false);
  // Scene 5
  scene('msg'); const box = $('#msgBox');
  const paras = ['Dear babe,', 'Happy 19th Birthday!', 'May this new chapter of your life bring you endless happiness, wonderful opportunities, unforgettable memories, and dreams that slowly turn into reality.', 'Keep being the amazing person you are.', 'May your smile never fade, your confidence keep growing, and your future shine brighter than a thousand stars.', 'You deserve all the beautiful things life has to offer.', 'Have the happiest birthday ever!'];
  for (const t of paras){ const p = document.createElement('p'); p.textContent = t; box.appendChild(p); await sleep(60); p.classList.add('show'); burst(fx.width*(.3+Math.random()*.4), fx.height*.25); await sleep(3600); if (!live()) return; }
  await sleep(2500);
  // Scene 6
  scene('friend'); const F = $('#fLine'); glow(.5);
  for (const t of ['You\u2019re officially 19 now!', 'Still one year younger than me, though! 😄', 'No matter how old we get, I hope our love always stays this special.']) { await say(F, t, 2600); if (!live()) return;
    for (let i = 0; i < 12; i++) parts.push({x: Math.random()*fx.width, y: fx.height+10, vx: (Math.random()-.5), vy: -(Math.random()*2+1), life: 1, d: .004, c: '#f2d78e', g: 0, r: 2+Math.random()*3}); }
  // Scene 7
  scene('final'); const f = n => $$('#final '+n).forEach(x => x.classList.add('show'));
  await sleep(1800); f('.f1'); await sleep(3500); f('.f2'); await sleep(4000); f('.f3'); fireworks(true); await sleep(2500); f('.f4');
}
function wish(){ return new Promise(res => {
  const btn = $('#hold'), ring = $('#ring'); let t0 = 0, raf = 0, done = false;
  const step = () => { const p = Math.min((performance.now()-t0)/3000, 1); ring.style.strokeDashoffset = 276.5*(1-p);
    if (p >= 1){ finish(); } else raf = requestAnimationFrame(step); };
  const begin = e => { if (done || t0) return; e.preventDefault(); t0 = performance.now(); raf = requestAnimationFrame(step); };
  const cancel = () => { if (done) return; cancelAnimationFrame(raf); t0 = 0; ring.style.strokeDashoffset = 276.5; };
  const key = (e, fn) => { if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat || fn === cancel) fn(e); e.preventDefault(); } };
  const kd = e => key(e, begin), ku = e => key(e, cancel);
  function finish(){ done = true; cleanup(); res(); }
  function cleanup(){ btn.removeEventListener('pointerdown', begin); ['pointerup','pointerleave','pointercancel'].forEach(n => btn.removeEventListener(n, cancel)); removeEventListener('keydown', kd); removeEventListener('keyup', ku); }
  btn.addEventListener('pointerdown', begin); ['pointerup','pointerleave','pointercancel'].forEach(n => btn.addEventListener(n, cancel));
  addEventListener('keydown', kd); addEventListener('keyup', ku);
}); }
$('#replay').onclick = () => { fireworks(false); start(); };