import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { ChevronDown, List, Mic, Power, Volume2, VolumeX } from "lucide-react";

export function LoadingGate({ failed, phase, onStarted }) {
  const { progress, active } = useProgress();
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const loaded = failed || (!active && progress >= 100);
  const ready = loaded && minDone;

  return (
    <AnimatePresence>
      {phase === "pre" && (
        <motion.div
          key="gate"
          className="loading-wrap"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          {!ready ? (
            <>
              <div className="loading-label">HYBRID SHOWROOM · WARMING UP THE GARAGE</div>
              <div className="loading-bar" data-testid="loading-bar">
                <div className="loading-fill" style={{ width: `${failed ? 100 : Math.max(progress, 6)}%` }} />
              </div>
              <div className="loading-pct">{failed ? "FALLBACK READY" : `${Math.round(Math.max(progress, 6))}%`}</div>
            </>
          ) : (
            <motion.div
              className="start-wrap"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="start-card" data-testid="start-popup">
                <div className="start-eyebrow">HYBRID SHOWROOM · BANGALORE</div>
                <div className="start-title">Start the engine</div>
                <div className="start-sub">Sound on for the full experience.</div>
                <button className="start-btn" data-testid="start-engine-btn" onClick={onStarted}>
                  <Power size={15} />
                  START THE ENGINE
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const lineV = {
  hidden: { y: "112%" },
  show: (i = 0) => ({
    y: 0,
    transition: { delay: 0.15 + i * 0.16, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function TitleBlock({ phase, openPanel }) {
  const show = phase === "igniting" || phase === "on";
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 22 });
  const sy = useSpring(my, { stiffness: 60, damping: 22 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 12);
      my.set((e.clientY / window.innerHeight - 0.5) * 7);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div className="hud" style={{ justifyContent: "flex-start" }}>
      <motion.div className="title-block" style={{ marginTop: "7vh", x: sx, y: sy }}>
        <AnimatePresence>
          {show && (
            <>
              <motion.div
                key="eyebrow"
                className="title-eyebrow"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                exit={{ opacity: 0 }}
              >
                VARUN MALANI · PRODUCT MANAGER · BANGALORE, INDIA
              </motion.div>
              <h1 className="title-main" data-testid="hero-title">
                <span className="title-line">
                  <motion.span custom={0} variants={lineV} initial="hidden" animate="show" style={{ display: "block" }}>
                    FULL <span className="red">THROTTLE</span>
                  </motion.span>
                </span>
              </h1>
              <motion.p
                className="title-sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                exit={{ opacity: 0 }}
              >
                Varun's journey through the lens of his passion
              </motion.p>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      {show && (
        <button className="index-btn clickable" data-testid="index-btn" onClick={() => openPanel("index")} aria-label="Open the index">
          <List size={13} />
          INDEX
        </button>
      )}
      <div className="corner-tag">
        SHOWROOM <b>01</b>
        <br />
        HYBRID <b>POWERTRAIN</b>
        <br />
        BANGALORE, <b>IN</b>
      </div>
    </div>
  );
}

export function Hud({ phase, idleOn, onToggleIdle, onScrollDown, micSupported, listening, caption, onMic }) {
  const on = phase === "on";
  const showHint = on && micSupported && !listening && !caption;
  return (
    <div className="hud" style={{ justifyContent: "flex-end" }}>
      <div className="hud-bottom">
        <div className="hint-line">
          DRAG TO ROTATE
          <br />
          SCROLL TO ZOOM
          <br />
          TAP A RED DOT
        </div>
        <button className="scroll-down clickable" data-testid="scroll-down-btn" onClick={onScrollDown}>
          FOOTER
          <span className="chev">
            <ChevronDown size={16} />
          </span>
        </button>
        <div className="ctrl-stack">
          {caption && (
            <div className={`caption-strip ${listening ? "listening" : ""}`} data-testid="voice-caption">
              <span className="cap-dot" />
              <span className="cap-text">{caption}</span>
            </div>
          )}
          {showHint && (
            <div className="voice-hint" data-testid="voice-hint">
              GIVE IT A TRY — SAY “START THE ENGINE”
            </div>
          )}
          <div className="ctrl-row">
            {micSupported && (
              <button
                className={`mic-pill clickable ${listening ? "listening" : ""}`}
                data-testid="mic-btn"
                onClick={onMic}
                aria-label={listening ? "Stop listening" : "Start voice command"}
              >
                <Mic size={13} />
                {listening ? "LISTENING" : "VOICE"}
              </button>
            )}
            <button
              className={`idle-toggle clickable ${idleOn ? "on" : ""}`}
              data-testid="idle-toggle"
              onClick={onToggleIdle}
              style={{ opacity: on ? 1 : 0, pointerEvents: on ? "auto" : "none", transition: "opacity 0.5s" }}
            >
              <span className="dot" />
              ENGINE IDLE
              {idleOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
