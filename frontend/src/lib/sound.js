// Engine sound: recorded clips in public/sounds.
// Startup plays through an <audio> element preloaded at import, so the click never waits on a fetch.
// Idle loops through Web Audio, because <audio loop> leaves an audible MP3 gap at the seam.

const START_SRC = "/sounds/lfa-start.mp3";
const IDLE_SRC = "/sounds/lfa-idle.mp3";
const IDLE_LEVEL = 0.5;

let ctx;
let startEl;
let idleBuf;
let idleLoading;
let idle = null;

if (typeof window !== "undefined") {
  startEl = new Audio(START_SRC);
  startEl.preload = "auto";
}

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function loadIdle() {
  if (!idleLoading) {
    idleLoading = fetch(IDLE_SRC)
      .then((r) => r.arrayBuffer())
      .then((b) => ac().decodeAudioData(b))
      .then((buf) => (idleBuf = buf))
      .catch(() => {
        idleLoading = null;
      });
  }
  return idleLoading;
}

export function playStartup() {
  if (!startEl) return;
  startEl.currentTime = 0;
  startEl.play().catch(() => {});
  // warm the idle loop so the toggle starts instantly later
  loadIdle();
}

export function setIdle(on) {
  const c = ac();
  if (on && !idle) {
    const master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);
    const state = { master, src: null, stopped: false };
    idle = state;
    loadIdle().then(() => {
      if (state.stopped || !idleBuf) return;
      const src = c.createBufferSource();
      src.buffer = idleBuf;
      src.loop = true;
      src.connect(master);
      src.start();
      state.src = src;
      master.gain.linearRampToValueAtTime(IDLE_LEVEL, c.currentTime + 0.6);
    });
  } else if (!on && idle) {
    const i = idle;
    idle = null;
    i.stopped = true;
    i.master.gain.cancelScheduledValues(c.currentTime);
    i.master.gain.setValueAtTime(i.master.gain.value, c.currentTime);
    i.master.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.5);
    setTimeout(() => {
      try {
        if (i.src) i.src.stop();
      } catch (e) {}
    }, 650);
  }
}

export function unlock() {
  try {
    ac();
  } catch (e) {}
}
