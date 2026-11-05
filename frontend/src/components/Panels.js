import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CHAPTER_META, CONTENT, INDEX_ROWS, VOICE_SAYINGS } from "../content";

const itemV = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Gauge({ angle }) {
  return (
    <svg className="gauge-svg" width="64" height="46" viewBox="0 0 64 46" aria-hidden="true">
      <path d="M6 38a26 26 0 0 1 52 0" fill="none" stroke="#26262b" strokeWidth="4" />
      <path d="M6 38a26 26 0 0 1 52 0" fill="none" stroke="#e10600" strokeWidth="4" strokeDasharray="34 82" />
      <g className="gauge-needle" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "32px 38px" }}>
        <line x1="32" y1="38" x2="32" y2="17" stroke="#f2efe9" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="32" cy="38" r="3" fill="#e10600" />
    </svg>
  );
}

function EngineBody({ d }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      <div className="motor-grid">
        {[d.m1, d.m2].map((m, mi) => (
          <motion.div className="motor" key={mi} custom={1 + mi} variants={itemV} initial="hidden" animate="show">
            <div className="motor-name">{m.name}</div>
            <div className="motor-title">{m.title}</div>
            <div className="motor-line">{m.line}</div>
            <div className="spec-grid">
              {m.specs.map(([v, k], i) => (
                <div className="spec-row" key={i}>
                  <span className="spec-key">{k}</span>
                  <span className="spec-val">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p className="ch-note" custom={4} variants={itemV} initial="hidden" animate="show">{d.note}</motion.p>
    </>
  );
}

function TyresBody({ d, firm }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      {d.firms.map((f, i) => (
        <TyreBlock key={i} f={f} i={i + 1} hl={firm === i} />
      ))}
      <motion.p className="ch-note" custom={6} variants={itemV} initial="hidden" animate="show">{d.note}</motion.p>
    </>
  );
}

function TyreBlock({ f, i, hl }) {
  const ref = useRef();
  useEffect(() => {
    if (hl && ref.current) ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [hl]);
  return (
    <motion.div ref={ref} className={`block-card ${hl ? "hl" : ""}`} custom={i} variants={itemV} initial="hidden" animate="show">
      <div className="block-eyebrow">
        <span>{f.pos}</span>
        <span className="yr">{f.years}</span>
      </div>
      <div className="block-title">{f.name}</div>
      <div className="block-role">{f.role}</div>
      <div className="block-line">{f.line}</div>
    </motion.div>
  );
}

function FuelBody({ d }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      <motion.div custom={1} variants={itemV} initial="hidden" animate="show" style={{ marginBottom: 18 }}>
        <Gauge angle={70} />
      </motion.div>
      {d.lines.map((l, i) => (
        <motion.div className="block-card" key={i} custom={2 + i} variants={itemV} initial="hidden" animate="show">
          <div className="block-eyebrow">
            <span>{l.num}</span>
          </div>
          <div className="block-title">{l.title}</div>
          <div className="block-line">{l.line}</div>
        </motion.div>
      ))}
      <motion.p className="ch-note" custom={7} variants={itemV} initial="hidden" animate="show">{d.note}</motion.p>
    </>
  );
}

function SuspensionBody({ d }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      {d.moments.map((m, i) => (
        <motion.div className="block-card" key={i} custom={1 + i} variants={itemV} initial="hidden" animate="show">
          <div className="block-eyebrow">
            <span>{m.num}</span>
            <span className="yr">{m.where}</span>
          </div>
          <div className="block-title">{m.title}</div>
          <div className="block-line">{m.line}</div>
        </motion.div>
      ))}
      <motion.p className="ch-note" custom={5} variants={itemV} initial="hidden" animate="show">{d.note}</motion.p>
    </>
  );
}

function CockpitBody({ d }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      {d.gauges.map((g, i) => (
        <motion.div className="block-card" key={i} custom={1 + i} variants={itemV} initial="hidden" animate="show">
          <div className="gauge-row" style={{ marginBottom: 8 }}>
            <Gauge angle={g.angle} />
            <div>
              <div className="block-eyebrow" style={{ marginBottom: 2 }}>{g.control}</div>
              <div className="block-title" style={{ fontSize: 20 }}>{g.name}</div>
            </div>
          </div>
          <div className="block-line">{g.line}</div>
          {g.link && (
            <a className="block-link" href={g.link.href} target="_blank" rel="noreferrer" data-testid={`cockpit-link-${g.name.toLowerCase().replace(/\s+/g, "-")}`}>
              {g.link.label} ↗
            </a>
          )}
        </motion.div>
      ))}
      <motion.div className="block-eyebrow" custom={6} variants={itemV} initial="hidden" animate="show" style={{ marginTop: 20, marginBottom: 4 }}>
        <span>SWITCH PANEL · MORE WORK</span>
      </motion.div>
      {d.switches.map((s, i) => (
        <motion.div className="switch-row" key={i} custom={7 + i} variants={itemV} initial="hidden" animate="show">
          <span className="switch-dot" />
          <div className="switch-main">
            {s.href ? (
              <a className="block-link" href={s.href} target="_blank" rel="noreferrer" style={{ borderBottom: "none" }}>
                <div className="switch-name">{s.name} ↗</div>
              </a>
            ) : (
              <div className="switch-name">{s.name}</div>
            )}
            <div className="switch-line">{s.line}</div>
          </div>
          <span className="switch-status">{s.status}</span>
        </motion.div>
      ))}
      <motion.p className="ch-note" custom={13} variants={itemV} initial="hidden" animate="show">{d.note}</motion.p>
    </>
  );
}

function HeadlightsBody({ d }) {
  const [beam, setBeam] = React.useState("low");
  const ideas = beam === "low" ? d.low : d.high;
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">{d.lede}</motion.p>
      <motion.div custom={1} variants={itemV} initial="hidden" animate="show">
        <div className="beam-switch" role="tablist" aria-label="Beam selector">
          <button
            data-testid="beam-low"
            className={`beam-btn ${beam === "low" ? "active" : ""}`}
            onClick={() => setBeam("low")}
          >
            LOW BEAM · SHORT TERM
          </button>
          <button
            data-testid="beam-high"
            className={`beam-btn ${beam === "high" ? "active" : ""}`}
            onClick={() => setBeam("high")}
          >
            HIGH BEAM · LONG TERM
          </button>
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div key={beam} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
          {ideas.map((idea, i) => (
            <motion.div
              className="beam-idea"
              key={i}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="beam-idea-num">{beam === "low" ? `LOW · IDEA 0${i + 1}` : `HIGH · IDEA 0${i + 1}`}</div>
              <div className="beam-idea-title">{idea.t}</div>
              <div className="beam-idea-line">{idea.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function SatNavBody({ d }) {
  return (
    <>
      <motion.div className="nav-dest" custom={0} variants={itemV} initial="hidden" animate="show">
        <div className="nav-dest-label">DESTINATION</div>
        <div className="nav-dest-text">{d.destination}</div>
      </motion.div>
      <motion.ul className="route" custom={1} variants={itemV} initial="hidden" animate="show">
        {d.route.map(([place, when], i) => (
          <li key={i}>
            {place}
            <span className="r-when">{when}</span>
          </li>
        ))}
      </motion.ul>
      <motion.div className="index-sec" custom={3} variants={itemV} initial="hidden" animate="show">
        {d.whyTitle}
      </motion.div>
      {d.whyBeats.map((b, i) => (
        <motion.div className="block-card" key={i} custom={4 + i} variants={itemV} initial="hidden" animate="show">
          <div className="block-eyebrow">
            <span>{b.num}</span>
          </div>
          <div className="block-title">{b.t}</div>
          <div className="block-line">{b.l}</div>
        </motion.div>
      ))}
    </>
  );
}

const INDEX_META = { num: "00", title: "Index", tag: "WHAT THE DOTS COVER · VOICE · CONTROLS" };

function IndexBody({ openPanel }) {
  return (
    <>
      <motion.p className="ch-lede" custom={0} variants={itemV} initial="hidden" animate="show">
        Every red dot on the car is one chapter of the story. This is what each one covers — tap a row to open it.
      </motion.p>
      {INDEX_ROWS.map((r, i) => (
        <motion.button
          className="index-row"
          key={r.chapter}
          data-testid={`index-row-${r.chapter}`}
          custom={1 + i}
          variants={itemV}
          initial="hidden"
          animate="show"
          onClick={() => openPanel(r.chapter)}
        >
          <span className="index-num">{r.num}</span>
          <span className="index-dot" />
          <span className="index-name">{r.name}</span>
          <span className="index-hint">{r.hint}</span>
        </motion.button>
      ))}
      <motion.div className="index-sec" custom={9} variants={itemV} initial="hidden" animate="show">
        VOICE COMMANDS
      </motion.div>
      {VOICE_SAYINGS.map((v, i) => (
        <motion.div className="voice-row" key={i} custom={10 + i} variants={itemV} initial="hidden" animate="show">
          <span className="voice-saying">{v.saying}</span>
          <span className="voice-opens">{v.opens}</span>
        </motion.div>
      ))}
      <motion.p className="ch-note" custom={17} variants={itemV} initial="hidden" animate="show">
        The mic works in Chrome and Edge. Everything on this page also works by click and tap — drag to rotate, scroll
        to zoom, tap a red dot.
      </motion.p>
    </>
  );
}

const BODIES = {
  engine: EngineBody,
  tyres: TyresBody,
  fuel: FuelBody,
  suspension: SuspensionBody,
  cockpit: CockpitBody,
  headlights: HeadlightsBody,
  satnav: SatNavBody,
  index: IndexBody,
};

export default function PanelHost({ panel, onClose, isMobile, openPanel }) {
  const meta = panel ? (panel.chapter === "index" ? INDEX_META : CHAPTER_META[panel.chapter]) : null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (panel && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [panel, isMobile]);

  const Body = panel ? BODIES[panel.chapter] : null;

  return (
    <AnimatePresence>
      {panel && meta && Body && (
        <motion.aside
          key="panel"
          className="panel"
          data-testid="side-panel"
          initial={isMobile ? { y: "105%" } : { x: "110%" }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: "105%" } : { x: "110%" }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
        >
          <div className="panel-head">
            <div>
              <div className="panel-chapter">
                {panel.chapter === "index" ? "SHOWROOM MENU" : `CHAPTER ${meta.num} / 07`}
              </div>
              <div className="panel-title">{meta.title}</div>
              <div className="panel-tag">{meta.tag}</div>
            </div>
            <button className="panel-close" data-testid="panel-close" onClick={onClose} aria-label="Close panel">
              <X size={17} />
            </button>
          </div>
          <div className="panel-body">
            <Body d={CONTENT[panel.chapter]} firm={panel.firm} openPanel={openPanel} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
