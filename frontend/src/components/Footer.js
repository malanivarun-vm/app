import React from "react";
import { motion } from "framer-motion";
import { METRICS, PROFILE } from "../content";

function VMBadge({ size = 62 }) {
  return (
    <svg className="vm-badge" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="12" fill="#0c0c0e" stroke="rgba(255,255,255,0.12)" />
      <path d="M13 41a19 19 0 0 1 38 0" fill="none" stroke="#2c2c31" strokeWidth="3.5" />
      <path d="M13 41a19 19 0 0 1 38 0" fill="none" stroke="#e10600" strokeWidth="3.5" strokeDasharray="26 60" strokeLinecap="round" />
      <line x1="32" y1="41" x2="43.5" y2="27.5" stroke="#e10600" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="41" r="3.2" fill="#e10600" />
      <text x="32" y="57" fontFamily="Saira Condensed, Arial, sans-serif" fontSize="13" fontWeight="800" fill="#f2efe9" textAnchor="middle" letterSpacing="1">
        VM
      </text>
    </svg>
  );
}

export default function FooterZone() {
  return (
    <motion.div
      id="footer-zone"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="marquee" data-testid="metrics-marquee" aria-label="Career metrics">
        <div className="mq-track">
          {[0, 1].map((copy) => (
            <div className="mq-group" key={copy} aria-hidden={copy === 1}>
              {METRICS.map((m, i) => (
                <span className="mq-item" key={i}>
                  <b>{m.b}</b>&nbsp;{m.t.toUpperCase()}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="footer" data-testid="footer">
        <div className="footer-grid">
          <div>
            <div className="badge-row">
              <VMBadge />
              <div>
                <div className="footer-name">Varun Malani</div>
                <div className="footer-role">
                  PRODUCT MANAGER · BANGALORE, INDIA
                  <br />
                  MECHANICAL ENGINEER TURNED PM
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="footer-h">CONTACT</div>
            <a className="footer-link" data-testid="footer-linkedin" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
              {PROFILE.linkedinLabel} ↗
            </a>
            <a className="footer-link" data-testid="footer-email" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
            <div className="footer-link" style={{ color: "var(--dim)" }}>
              Bangalore, India
            </div>
          </div>

          <div>
            <div className="footer-h">HOW THIS WAS MADE</div>
            <span className="wispr-badge" data-testid="wispr-badge">
              <span className="bars" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              BUILT BY VOICE WITH WISPR FLOW
            </span>
          </div>
        </div>

        <div className="footer-base">
          <span>© 2026 VARUN MALANI</span>
          <span>FULL THROTTLE · HYBRID SHOWROOM 01</span>
        </div>
      </footer>
    </motion.div>
  );
}
