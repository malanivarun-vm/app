import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import Garage, { FallbackStage } from "./components/Garage";
import PanelHost from "./components/Panels";
import { LoadingGate, TitleBlock, Hud } from "./components/Overlay";
import FooterZone from "./components/Footer";
import * as sound from "./lib/sound";

function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia("(max-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const f = (e) => setM(e.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return m;
}

function useReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = (e) => setR(e.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return r;
}

export default function App() {
  const [phase, setPhase] = useState("pre");
  const [panel, setPanel] = useState(null);
  const [failed, setFailed] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [idleOn, setIdleOn] = useState(false);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!modelLoaded) setFailed(true);
    }, 30000);
    return () => clearTimeout(t);
  }, [modelLoaded]);

  const handleModelReady = useCallback(() => setModelLoaded(true), []);
  const handleModelError = useCallback(() => setFailed(true), []);

  const startEngine = () => {
    sound.playStartup();
    setPhase("igniting");
    setTimeout(() => setPhase("on"), 1700);
  };

  const openPanel = useCallback((chapter, firm = null) => {
    setPanel({ chapter, firm });
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  const toggleIdle = () => {
    setIdleOn((v) => {
      sound.setIdle(!v);
      return !v;
    });
  };

  const scrollDown = () => {
    const el = document.getElementById("footer-zone");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-root">
      <div className="stage">
        {failed ? (
          <FallbackStage phase={phase} panel={panel} openPanel={openPanel} />
        ) : (
          <Garage
            phase={phase}
            panel={panel}
            openPanel={openPanel}
            onReady={handleModelReady}
            onModelError={handleModelError}
            isMobile={isMobile}
            reduced={reduced}
          />
        )}
        <TitleBlock phase={phase} />
        <Hud phase={phase} idleOn={idleOn} onToggleIdle={toggleIdle} onScrollDown={scrollDown} />
        <LoadingGate failed={failed} phase={phase} onStarted={startEngine} />
        <PanelHost panel={panel} onClose={closePanel} isMobile={isMobile} />
      </div>
      <FooterZone />
      <div className="grain" />
    </div>
  );
}
