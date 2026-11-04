import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Garage, { FallbackStage } from "./components/Garage";
import PanelHost from "./components/Panels";
import { LoadingGate, TitleBlock, Hud } from "./components/Overlay";
import FooterZone from "./components/Footer";
import * as sound from "./lib/sound";
import Lenis from "lenis";

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
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState(null);
  const [micSupported] = useState(() =>
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const recRef = useRef(null);
  const finalRef = useRef("");
  const captionTimer = useRef(null);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!modelLoaded) setFailed(true);
    }, 30000);
    return () => clearTimeout(t);
  }, [modelLoaded]);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  useEffect(() => {
    return () => {
      if (recRef.current) {
        try {
          recRef.current.abort();
        } catch (e) {}
      }
      if (captionTimer.current) clearTimeout(captionTimer.current);
    };
  }, []);

  const handleModelReady = useCallback(() => setModelLoaded(true), []);
  const handleModelError = useCallback(() => setFailed(true), []);

  const startEngine = (withPanel = null) => {
    sound.playStartup();
    setPhase("igniting");
    setTimeout(() => {
      setPhase("on");
      if (withPanel) setPanel({ chapter: withPanel, firm: null });
    }, 1700);
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

  const scheduleClear = () => {
    if (captionTimer.current) clearTimeout(captionTimer.current);
    captionTimer.current = setTimeout(() => setCaption(null), 4500);
  };

  const matchCommand = (text) => {
    const s = text.toLowerCase();
    if (/(headlight|low beam|high beam|lights)/.test(s)) return "headlights";
    if (/cockpit/.test(s)) return "cockpit";
    if (/(drive|drives|fuel)/.test(s)) return "fuel";
    if (/suspension/.test(s)) return "suspension";
    if (/(going|nav|route|wispr|headed)/.test(s)) return "satnav";
    if (/(engine|start|ignite)/.test(s)) return "engine";
    return null;
  };

  const VOICE_NAMES = {
    engine: "The Engine",
    headlights: "The Headlights",
    cockpit: "The Cockpit",
    fuel: "The Fuel Tank",
    suspension: "The Suspension",
    satnav: "The Sat Nav",
  };

  const handleFinal = (text) => {
    if (!text || !text.trim()) {
      setCaption("Heard nothing — tap the mic and try again");
      scheduleClear();
      return;
    }
    const chapter = matchCommand(text);
    if (!chapter) {
      setCaption("No match — try “start the engine”, or open the Index");
      scheduleClear();
      return;
    }
    if (chapter === "engine" && phaseRef.current !== "on") {
      setCaption("“" + text.trim() + "” — starting the engine");
      startEngine("engine");
    } else {
      setCaption("“" + text.trim() + "” — " + VOICE_NAMES[chapter]);
      setPanel({ chapter, firm: null });
    }
    scheduleClear();
  };

  const startListening = () => {
    sound.unlock();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    recRef.current = rec;
    finalRef.current = "";
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      if (e.results[e.results.length - 1].isFinal) finalRef.current = txt;
      setCaption(txt.trim() || "Listening…");
    };
    rec.onerror = (e) => {
      setListening(false);
      const msgs = {
        "not-allowed": "Mic blocked — allow microphone access and try again",
        "service-not-allowed": "Mic blocked — allow microphone access and try again",
        "no-speech": "No speech heard — tap the mic and try again",
        "audio-capture": "No microphone found on this device",
      };
      setCaption(msgs[e.error] || "Voice error — try again");
      scheduleClear();
    };
    rec.onend = () => {
      setListening(false);
      handleFinal(finalRef.current);
    };
    try {
      rec.start();
      setListening(true);
      setCaption("Listening…");
    } catch (e) {
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  return (
    <div className="app-root">
      <div className="stage" data-lenis-prevent>
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
        <TitleBlock phase={phase} openPanel={openPanel} />
        <Hud
          phase={phase}
          idleOn={idleOn}
          onToggleIdle={toggleIdle}
          onScrollDown={scrollDown}
          micSupported={micSupported}
          listening={listening}
          caption={caption}
          onMic={toggleMic}
        />
        <LoadingGate failed={failed} phase={phase} onStarted={startEngine} />
        <PanelHost panel={panel} onClose={closePanel} isMobile={isMobile} openPanel={openPanel} />
      </div>
      <FooterZone />
      <div className="grain" />
    </div>
  );
}
