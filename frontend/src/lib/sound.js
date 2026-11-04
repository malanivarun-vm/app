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
  out.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  out.connect(comp);
  comp.connect(c.destination);

  // short starter whirr
  const st = c.createOscillator();
  st.type = "sawtooth";
  st.frequency.setValueAtTime(70, t);
  st.frequency.linearRampToValueAtTime(120, t + 0.5);
  const stg = c.createGain();
  stg.gain.setValueAtTime(0, t);
  stg.gain.linearRampToValueAtTime(0.05, t + 0.06);
  stg.gain.setValueAtTime(0.05, t + 0.45);
  stg.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
  const stf = c.createBiquadFilter();
  stf.type = "bandpass";
  stf.frequency.value = 900;
  stf.Q.value = 2;
  st.connect(stf);
  stf.connect(stg);
  stg.connect(out);
  st.start(t);
  st.stop(t + 0.65);

  // catch thump at ~0.55s
  const th = c.createOscillator();
  th.type = "sine";
  th.frequency.setValueAtTime(140, t + 0.55);
  th.frequency.exponentialRampToValueAtTime(45, t + 0.8);
  const thg = c.createGain();
  thg.gain.setValueAtTime(0.6, t + 0.55);
  thg.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
  th.connect(thg);
  thg.connect(out);
  th.start(t + 0.55);
  th.stop(t + 1.0);
  const cn = c.createBufferSource();
  cn.buffer = noiseBuffer(c, 0.4);
  const cf = c.createBiquadFilter();
  cf.type = "lowpass";
  cf.frequency.value = 300;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0.5, t + 0.55);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
  cn.connect(cf);
  cf.connect(cg);
  cg.connect(out);
  cn.start(t + 0.55);

  // V12 core: harmonic stack through a shaper, rpm sweep 70 -> 640 Hz fundamental
  const dist = c.createWaveShaper();
  dist.curve = shaperCurve(3.2);
  dist.oversample = "2x";
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 1.1;
  lp.frequency.setValueAtTime(500, t + 0.55);
  lp.frequency.linearRampToValueAtTime(5200, t + 2.05);
  lp.frequency.exponentialRampToValueAtTime(1100, t + 3.2);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 42;
  const eg = c.createGain();
  eg.gain.setValueAtTime(0.0001, t + 0.55);
  eg.gain.linearRampToValueAtTime(0.55, t + 0.72);
  eg.gain.setValueAtTime(0.55, t + 1.5);
  eg.gain.linearRampToValueAtTime(0.65, t + 2.05);
  eg.gain.linearRampToValueAtTime(0.4, t + 2.8);
  eg.gain.linearRampToValueAtTime(0.28, t + 3.5);
  eg.gain.linearRampToValueAtTime(0.0001, t + 4.4);
  dist.connect(lp);
  lp.connect(hp);
  hp.connect(eg);
  eg.connect(out);

  const mkOsc = (type, mul, g) => {
    const o = c.createOscillator();
    o.type = type;
    const og = c.createGain();
    og.gain.value = g;
    o.frequency.setValueAtTime(70 * mul, t + 0.55);
    o.frequency.linearRampToValueAtTime(120 * mul, t + 0.95);
    o.frequency.linearRampToValueAtTime(340 * mul, t + 1.7);
    o.frequency.linearRampToValueAtTime(640 * mul, t + 2.15);
    o.frequency.exponentialRampToValueAtTime(300 * mul, t + 2.75);
    o.frequency.exponentialRampToValueAtTime(125 * mul, t + 3.4);
    o.frequency.exponentialRampToValueAtTime(105 * mul, t + 4.2);
    o.connect(og);
    og.connect(dist);
    o.start(t + 0.55);
    o.stop(t + 4.5);
    return o;
  };
  const oscs = [
    mkOsc("sawtooth", 1, 0.5),
    mkOsc("sawtooth", 1.007, 0.42),
    mkOsc("square", 0.5, 0.34),
    mkOsc("sawtooth", 2, 0.3),
    mkOsc("sawtooth", 3.01, 0.2),
    mkOsc("sawtooth", 4.02, 0.12),
  ];

  // firing roughness: fast FM wobble at the catch, fading as the revs rise
  const fm = c.createOscillator();
  fm.type = "square";
  fm.frequency.setValueAtTime(23, t + 0.55);
  fm.frequency.linearRampToValueAtTime(9, t + 2.2);
  const fmg = c.createGain();
  fmg.gain.setValueAtTime(14, t + 0.55);
  fmg.gain.linearRampToValueAtTime(3, t + 2.4);
  fmg.gain.linearRampToValueAtTime(0, t + 3.2);
  fm.connect(fmg);
  oscs.forEach((o) => fmg.connect(o.frequency));
  fm.start(t + 0.55);
  fm.stop(t + 4.5);

  // exhaust rasp: noise through an rpm-tracking bandpass
  const ex = c.createBufferSource();
  ex.buffer = noiseBuffer(c, 4.2);
  const exf = c.createBiquadFilter();
  exf.type = "bandpass";
  exf.Q.value = 0.7;
  exf.frequency.setValueAtTime(600, t + 0.55);
  exf.frequency.linearRampToValueAtTime(2700, t + 2.15);
  exf.frequency.exponentialRampToValueAtTime(900, t + 3.3);
  const exg = c.createGain();
  exg.gain.setValueAtTime(0.06, t + 0.55);
  exg.gain.linearRampToValueAtTime(0.16, t + 2.1);
  exg.gain.linearRampToValueAtTime(0.06, t + 3.0);
  exg.gain.linearRampToValueAtTime(0.0001, t + 4.2);
  ex.connect(exf);
  exf.connect(exg);
  exg.connect(out);
  ex.start(t + 0.55);

  // backfire crackle right at the catch
  const bp = c.createBufferSource();
  bp.buffer = noiseBuffer(c, 0.25);
  const bpf = c.createBiquadFilter();
  bpf.type = "highpass";
  bpf.frequency.value = 1500;
  const bpg = c.createGain();
  bpg.gain.setValueAtTime(0.28, t + 0.56);
  bpg.gain.exponentialRampToValueAtTime(0.001, t + 0.72);
  bp.connect(bpf);
  bpf.connect(bpg);
  bpg.connect(out);
  bp.start(t + 0.56);
}

let idle = null;

export function setIdle(on) {
  const c = ac();
  if (on && !idle) {
    const master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);

    const dist = c.createWaveShaper();
    dist.curve = shaperCurve(2.6);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.8;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 45;
    dist.connect(lp);
    lp.connect(hp);
    hp.connect(master);

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
    const o1 = mk("sawtooth", 88, 0.5);
    const o2 = mk("sawtooth", 88.7, 0.42);
    const o3 = mk("square", 44, 0.3);
    const o4 = mk("sawtooth", 176, 0.14);

    // firing roughness: amplitude wobble ~21 Hz on top of the idle
    const am = c.createOscillator();
    am.frequency.value = 21;
    const amg = c.createGain();
    amg.gain.value = 0.05;
    am.connect(amg);
    amg.connect(master.gain);
    am.start();

    // slow pitch wobble so the idle never sits perfectly still
    const w = c.createOscillator();
    w.frequency.value = 4.2;
    const wg = c.createGain();
    wg.gain.value = 2.4;
    w.connect(wg);
    wg.connect(o1.frequency);
    wg.connect(o2.frequency);
    w.start();

    const ns = c.createBufferSource();
    ns.buffer = noiseBuffer(c, 2);
    ns.loop = true;
    const nf = c.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 850;
    nf.Q.value = 0.6;
    const ng2 = c.createGain();
    ng2.gain.value = 0.014;
    ns.connect(nf);
    nf.connect(ng2);
    ng2.connect(master);
    ns.start();

    master.gain.linearRampToValueAtTime(0.14, c.currentTime + 0.8);
    idle = {
      master,
      stop: () =>
        [o1, o2, o3, o4, am, w, ns].forEach((n) => {
          try {
            n.stop();
          } catch (e) {}
        }),
    };
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
