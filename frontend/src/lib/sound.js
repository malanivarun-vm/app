let ctx;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function shaperCurve(k = 2.5) {
  const n = 1024;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x);
  }
  return c;
}

function noiseBuffer(c, dur) {
  const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

export function playStartup() {
  const c = ac();
  const t = c.currentTime + 0.05;

  const out = c.createGain();
  out.gain.value = 0.85;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 6;
  out.connect(comp);
  comp.connect(c.destination);

  // starter motor whirr
  const wh = c.createOscillator();
  wh.type = "sawtooth";
  wh.frequency.setValueAtTime(34, t);
  wh.frequency.linearRampToValueAtTime(70, t + 0.8);
  const whg = c.createGain();
  whg.gain.setValueAtTime(0, t);
  whg.gain.linearRampToValueAtTime(0.11, t + 0.1);
  whg.gain.setValueAtTime(0.11, t + 0.72);
  whg.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
  const whf = c.createBiquadFilter();
  whf.type = "bandpass";
  whf.frequency.value = 420;
  whf.Q.value = 1.4;
  wh.connect(whf);
  whf.connect(whg);
  whg.connect(out);
  wh.start(t);
  wh.stop(t + 1.0);

  // starter grind
  const ns = c.createBufferSource();
  ns.buffer = noiseBuffer(c, 1.0);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.045, t + 0.08);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
  const nf = c.createBiquadFilter();
  nf.type = "bandpass";
  nf.frequency.value = 900;
  nf.Q.value = 0.8;
  ns.connect(nf);
  nf.connect(ng);
  ng.connect(out);
  ns.start(t);

  // engine catch + rev
  const dist = c.createWaveShaper();
  dist.curve = shaperCurve(2.5);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 0.9;
  lp.frequency.setValueAtTime(260, t + 0.9);
  lp.frequency.linearRampToValueAtTime(2400, t + 1.85);
  lp.frequency.exponentialRampToValueAtTime(620, t + 3.4);
  const eg = c.createGain();
  eg.gain.setValueAtTime(0, t + 0.88);
  eg.gain.linearRampToValueAtTime(0.5, t + 1.05);
  eg.gain.setValueAtTime(0.5, t + 1.9);
  eg.gain.linearRampToValueAtTime(0.3, t + 2.6);
  eg.gain.linearRampToValueAtTime(0.22, t + 3.4);
  eg.gain.linearRampToValueAtTime(0.0001, t + 3.9);
  dist.connect(lp);
  lp.connect(eg);
  eg.connect(out);

  const mk = (type, mul, g) => {
    const o = c.createOscillator();
    o.type = type;
    const og = c.createGain();
    og.gain.value = g;
    o.frequency.setValueAtTime(48 * mul, t + 0.9);
    o.frequency.linearRampToValueAtTime(82 * mul, t + 1.15);
    o.frequency.linearRampToValueAtTime(185 * mul, t + 1.95);
    o.frequency.linearRampToValueAtTime(120 * mul, t + 2.6);
    o.frequency.exponentialRampToValueAtTime(88 * mul, t + 3.5);
    o.connect(og);
    og.connect(dist);
    o.start(t + 0.9);
    o.stop(t + 4.0);
  };
  mk("sawtooth", 1, 0.55);
  mk("square", 0.5, 0.5);
  mk("sawtooth", 2.02, 0.16);

  // exhaust pop at catch
  const pop = c.createBufferSource();
  pop.buffer = noiseBuffer(c, 0.35);
  const pf = c.createBiquadFilter();
  pf.type = "lowpass";
  pf.frequency.value = 320;
  const pg = c.createGain();
  pg.gain.setValueAtTime(0.4, t + 0.9);
  pg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  pop.connect(pf);
  pf.connect(pg);
  pg.connect(out);
  pop.start(t + 0.9);
}

let idle = null;

export function setIdle(on) {
  const c = ac();
  if (on && !idle) {
    const master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    lp.Q.value = 0.7;
    lp.connect(master);

    const dist = c.createWaveShaper();
    dist.curve = shaperCurve(2.2);
    dist.connect(lp);

    const mk = (type, f, g) => {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const og = c.createGain();
      og.gain.value = g;
      o.connect(og);
      og.connect(dist);
      o.start();
      return o;
    };
    const o1 = mk("sawtooth", 52, 0.5);
    const o2 = mk("sawtooth", 52.8, 0.4);
    const o3 = mk("square", 26, 0.32);

    const lfo = c.createOscillator();
    lfo.frequency.value = 9;
    const lg = c.createGain();
    lg.gain.value = 0.05;
    lfo.connect(lg);
    lg.connect(master.gain);
    lfo.start();

    const ns = c.createBufferSource();
    ns.buffer = noiseBuffer(c, 2);
    ns.loop = true;
    const nf = c.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 500;
    nf.Q.value = 0.6;
    const ng2 = c.createGain();
    ng2.gain.value = 0.018;
    ns.connect(nf);
    nf.connect(ng2);
    ng2.connect(master);
    ns.start();

    master.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.8);
    idle = { master, stop: () => [o1, o2, o3, lfo, ns].forEach((n) => { try { n.stop(); } catch (e) {} }) };
  } else if (!on && idle) {
    const i = idle;
    idle = null;
    i.master.gain.cancelScheduledValues(c.currentTime);
    i.master.gain.setValueAtTime(i.master.gain.value || 0.15, c.currentTime);
    i.master.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.5);
    setTimeout(() => i.stop(), 650);
  }
}

export function unlock() {
  try {
    ac();
  } catch (e) {}
}
