"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAssessmentData, getTier, getTierDesc, getNextSteps,
  API_URL,
  type AssessmentData, type Persona, type Dimension, type Tier, type NextStep,
} from "@/lib/constants";

type View = "splash" | "landing" | "assess" | "results";
type AssessStep = "wizard";

interface UserInfo {
  firstName: string; lastName: string; email: string;
  company: string; title: string; phone: string; detailsId: string;
}

// ═══════════════════════════════════
// SVG Logo Animation Variants
// ═══════════════════════════════════
const svgDrawVariants = {
  hidden: { pathLength: 0, fillOpacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    fillOpacity: 1,
    transition: {
      pathLength: { delay: i * 0.4, type: "spring" as const, duration: 1.5, bounce: 0 },
      fillOpacity: { delay: i * 0.4 + 0.6, duration: 0.8 }
    }
  })
};

const AlgoleapIcon = ({ animated = false, className = "", style = {} }: { animated?: boolean, className?: string, style?: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 50" fill="none" className={className} style={style}>
    {animated ? (
      <>
        <motion.path d="M41.916 0H8.5253C3.81689 0 0 3.96988 0 8.867V41.133C0 46.03 3.81689 50 8.5253 50H41.916C46.6244 50 50.4413 46.03 50.4413 41.133V8.867C50.4413 3.96988 46.6244 0 41.916 0Z" stroke="#3C8943" strokeWidth="1" fill="#3C8943" variants={svgDrawVariants} custom={0} initial="hidden" animate="visible" />
        <motion.path d="M25.5759 25.9853L16.5178 33.5577V18.4128L25.5759 25.9853Z" stroke="#3C8943" strokeWidth="1" fill="#3C8943" variants={svgDrawVariants} custom={1} initial="hidden" animate="visible" />
        <motion.path d="M41.6792 8.12793H37.4166C36.8934 8.12793 36.4693 8.56904 36.4693 9.11315V40.8866C36.4693 41.4306 36.8934 41.8718 37.4166 41.8718H41.6792C42.2023 41.8718 42.6265 41.4306 42.6265 40.8866V9.11315C42.6265 8.56904 42.2023 8.12793 41.6792 8.12793Z" stroke="white" strokeWidth="1" fill="white" variants={svgDrawVariants} custom={2} initial="hidden" animate="visible" />
        <motion.path fillRule="evenodd" clipRule="evenodd" d="M15.5549 8.87101C12.131 6.78343 7.81488 9.34227 7.81488 13.4597V36.54C7.81488 40.6575 12.131 43.2164 15.5549 41.1287L34.482 29.5885C37.858 27.5302 37.858 22.4696 34.482 20.4112L15.5549 8.87101ZM14.1492 35.2868L28.0535 24.9196L14.1492 14.5523V35.2868Z" stroke="white" strokeWidth="1" fill="white" variants={svgDrawVariants} custom={3} initial="hidden" animate="visible" />
      </>
    ) : (
      <>
        <path d="M41.916 0H8.5253C3.81689 0 0 3.96988 0 8.867V41.133C0 46.03 3.81689 50 8.5253 50H41.916C46.6244 50 50.4413 46.03 50.4413 41.133V8.867C50.4413 3.96988 46.6244 0 41.916 0Z" fill="#3C8943" />
        <path d="M25.5759 25.9853L16.5178 33.5577V18.4128L25.5759 25.9853Z" fill="#3C8943" />
        <path d="M41.6792 8.12793H37.4166C36.8934 8.12793 36.4693 8.56904 36.4693 9.11315V40.8866C36.4693 41.4306 36.8934 41.8718 37.4166 41.8718H41.6792C42.2023 41.8718 42.6265 41.4306 42.6265 40.8866V9.11315C42.6265 8.56904 42.2023 8.12793 41.6792 8.12793Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M15.5549 8.87101C12.131 6.78343 7.81488 9.34227 7.81488 13.4597V36.54C7.81488 40.6575 12.131 43.2164 15.5549 41.1287L34.482 29.5885C37.858 27.5302 37.858 22.4696 34.482 20.4112L15.5549 8.87101ZM14.1492 35.2868L28.0535 24.9196L14.1492 14.5523V35.2868Z" fill="white" />
      </>
    )}
  </svg>
);

export default function Home() {
  // ── Assessment data from API ──
  const [data, setData] = useState<AssessmentData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [view, setView] = useState<View>("splash");
  const [assessStep, setAssessStep] = useState<AssessStep>("wizard");
  const [persona, setPersona] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [wizStep, setWizStep] = useState(0);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<any>(null);

  // Dim expand state
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  // Copy state
  const [copyOk, setCopyOk] = useState(false);

  // Form refs
  const [formData, setFormData] = useState<any>({});

  // ── Derived from data ──
  const personas: Persona[] = data?.personas || [];
  const clouds: string[] = data?.clouds || [];
  const dims: Dimension[] = persona && data 
    ? [...(data.dimensions[persona] || [])].sort((a, b) => a.order - b.order) 
    : [];
  const tiers: Tier[] = data?.tiers || [];
  const DEFAULT_TIER: Tier = { min: 0, label: '—', color: '#888', bg: '#f0f0f0' };
  
  // Weighted score calculation: sum(score * weight) / 5
  // Since weights sum to 100, max score is 500. Dividing by 5 gives 0-100.
  const totalScore = dims.reduce((acc, d) => acc + ((scores[d.id] || 0) * d.weight) / 5, 0);
  
  const tier = getTier(totalScore, tiers) || DEFAULT_TIER;
  const answered = Object.keys(scores).length;

  const toast = useCallback((msg: string) => {
    setToastMsg(msg); setToastOn(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3000);
  }, []);

  // ── Load assessment data from API ──
  useEffect(() => {
    fetchAssessmentData()
      .then(d => { setData(d); setDataLoading(false); })
      .catch(() => setDataLoading(false));
  }, []);

  // ── Splash auto-skip ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (view === "splash") setView("landing");
    }, 3400);
    return () => clearTimeout(t);
  }, [view]);

  // ── Helpers ──
  const resetAssessment = () => {
    setScores({});
    setWizStep(0);
    setUser(null);
    setPersona(null);
    setFormData({});
    setPdfUrl(null);
  };

  const navTo = (v: View) => {
    if (v === "landing" || v === "splash") resetAssessment();
    setView(v);
    window.scrollTo(0, 0);
  };

  const handleNavClick = (targetView: View, anchorId?: string) => {
    if (view === "assess") {
      toast("⚠️ Please complete or exit the assessment first.");
      return;
    }
    navTo(targetView);
    if (anchorId) {
      setTimeout(() => document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const startAssessment = () => {
    setAssessStep("wizard"); setScores({}); setWizStep(0);
    navTo("assess");
  };

  const submitUser = () => {
    const first = formData.uFirst?.trim();
    const last = formData.uLast?.trim();
    const email = formData.uEmail?.trim();
    if (!first || !last || !email) { toast("⚠️ Please fill in required fields"); return; }
    if (!persona) { toast("⚠️ Please select your role"); return; }
    setUser({
      firstName: first, lastName: last, email,
      company: formData.uCompany || "", title: formData.uTitle || "",
      phone: formData.uPhone || "",
      detailsId: "ALG-2026-" + String(Math.floor(Math.random() * 90000) + 10000),
    });
    setShowUserModal(false);
    startAssessment();
  };

  const generateResults = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        user,
        persona,
        scores,
        totalScore,
        tier: tier.label
      };
      const res = await fetch(`${API_URL}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        toast("⚠️ Failed to generate full report. Showing partial results.");
      } else {
        const result = await res.json();
        if (result.pdfUrl) setPdfUrl(result.pdfUrl);
      }
    } catch (err) {
      toast("⚠️ Network error generating results");
    } finally {
      setIsGenerating(false);
      navTo("results");
    }
  };

  const pickLevel = (dimId: string, score: number) => {
    setScores(prev => ({ ...prev, [dimId]: score }));
    if (wizStep < dims.length - 1) setTimeout(() => setWizStep(w => w + 1), 320);
  };

  const buildShareUrl = () => {
    const base = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    return `${base}#score=${Math.round(totalScore)}&tier=${encodeURIComponent(tier.label)}&persona=${persona}`;
  };

  const shareOn = (platform: string) => {
    const msg = `I just scored ${Math.round(totalScore)}/100 on the Algoleap Agentforce Readiness Scorecard — "${tier.label}". How ready is your data for AI agents? 🤖`;
    const url = buildShareUrl();
    const urls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(msg)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(msg + "\n\n" + url)}`,
      email: `mailto:?subject=${encodeURIComponent("My Agentforce Readiness Score — Algoleap")}&body=${encodeURIComponent(msg + "\n\n" + url)}`,
    };
    window.open(urls[platform], "_blank");
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(buildShareUrl()); } catch { /* fallback */ }
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2500);
  };

  const submitLead = (type: "book" | "pdf") => {
    const prefix = type === "book" ? "b" : "p";
    const name = formData[`${prefix}Name`]?.trim();
    const email = formData[`${prefix}Email`]?.trim();
    if (!name || !email) { toast("⚠️ Please fill in required fields"); return; }
    if (type === "book") setShowBookModal(false);
    else setShowPdfModal(false);
    toast(type === "book"
      ? "✅ Booking confirmed! You'll receive a calendar invite shortly."
      : "✅ Report sent! Check your inbox within 60 seconds.");
  };

  // ════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════

  return (
    <>
      {/* ── SPLASH ── */}
      <AnimatePresence>
        {view === "splash" && (
          <motion.div
            key="splash"
            className="splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setView("landing")}
            role="button"
            aria-label="Skip splash screen and go to main content"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setView('landing'); }}
          >
            {/* 🔴 ANIMATED SPLASH LOGO 🔴 */}
            <motion.div
              layoutId="brand-logo"
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}
            >
              <AlgoleapIcon animated={true} style={{ width: 72, height: 72 }} />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                style={{ fontSize: 52, fontWeight: 800, color: '#3C8943', letterSpacing: '-0.04em' }}
              >
                algoleap
              </motion.div>
            </motion.div>

            <motion.div className="sp-title" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.2, duration: 0.8, ease: [.22, 1, .36, 1] }}>
              Agentforce Readiness Scorecard
            </motion.div>
            <motion.div className="sp-tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.7 }}>
              7-Dimension Data Readiness Framework
            </motion.div>
            <div className="sp-bar" role="progressbar" aria-label="Loading progress" aria-valuemin={0} aria-valuemax={100}>
              <motion.div className="sp-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1.5, duration: 2.5, ease: "linear" }} />
            </div>
            <motion.div className="sp-skip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
              Click anywhere to skip →
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SHELL ── */}
      {view !== "splash" && (
        <div className="shell">
          {/* HEADER */}
          <header className="hdr" role="banner">
            <div className="hdr-inner">
              <motion.a
                layoutId="brand-logo"
                className="hdr-brand"
                onClick={(e) => { e.preventDefault(); handleNavClick("landing"); }}
                href="#"
                aria-label="Algoleap Salesforce Practice — Go to homepage"
                title="Algoleap Salesforce Practice"
                style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <AlgoleapIcon animated={false} style={{ width: 28, height: 28 }} />
                <span style={{ fontSize: 24, fontWeight: 800, color: '#3C8943', letterSpacing: '-0.04em', marginRight: 4 }}>algoleap</span>
                <div className="hdr-brand-divider" aria-hidden="true" />
                <span className="hdr-brand-label">Salesforce Practice</span>
              </motion.a>
              <nav className="hdr-nav" aria-label="Main navigation">
                {view === "landing" && (
                  <button id="nav-how-it-works" onClick={() => handleNavClick("landing", "how-it-works")}>How It Works</button>
                )}
                {view === "results" && (
                  <button id="nav-home" onClick={() => navTo("landing")}>Return Home</button>
                )}
              </nav>
            </div>
          </header>

          <main id="main-content" role="main">
            {/* ════ LANDING ════ */}
            {view === "landing" && (
              <>
                <section className="hero" aria-labelledby="hero-heading">
                  <p className="hero-eyebrow">Algoleap · 7-Dimension Data Readiness Framework</p>
                  <h1 id="hero-heading">Is Your Organisation Ready<br />for Agentforce?</h1>
                  <p>Take our 3-minute assessment based on Algoleap&apos;s 7-Dimension Data Readiness Framework — used across 14+ Salesforce implementations.</p>
                  <button id="cta-start-assessment" className="hero-cta" onClick={() => setShowUserModal(true)} aria-label="Start your free Agentforce readiness assessment">Start Your Assessment →</button>
                  <p className="hero-note">No credit card · 3 minutes · Instant results</p>
                </section>
                <section className="section" id="how-it-works" aria-labelledby="how-it-works-heading">
                  <h2 id="how-it-works-heading" className="section-title">How It Works</h2>
                  <p className="section-sub">Three steps. Three minutes. A clear roadmap to Agentforce.</p>
                  <div className="how-grid" role="list">
                    <article className="how-card" role="listitem"><div className="how-num" aria-hidden="true">1</div><h3>Select Your Role</h3><p>Choose the persona path that matches your function — Business, Technical, or AI leader.</p></article>
                    <article className="how-card" role="listitem"><div className="how-num" aria-hidden="true">2</div><h3>Answer 7 Questions</h3><p>Rate your organisation across 7 data readiness dimensions. Takes about 3 minutes.</p></article>
                    <article className="how-card" role="listitem"><div className="how-num" aria-hidden="true">3</div><h3>Get Your Roadmap</h3><p>Receive a personalised readiness score, tier interpretation, and prioritised next steps.</p></article>
                  </div>
                </section>
                <aside className="cs-band" aria-label="Customer success story">
                  <figure className="cs-inner">
                    <blockquote className="cs-quote">&quot;A $2B professional services firm discovered 3 of 5 data sources weren&apos;t clean enough for Agentforce. We fixed that in 2 weeks — and their pilot launched on schedule.&quot;</blockquote>
                    <figcaption className="cs-attr">— Algoleap Salesforce Practice · Enterprise Services Case Study</figcaption>
                  </figure>
                </aside>
              </>
            )}

            {/* ════ ASSESSMENT ════ */}
            {view === "assess" && (
              <section className="assess-shell" aria-labelledby="assess-heading">
                <h2 id="assess-heading" className="sr-only">Agentforce Readiness Assessment</h2>

                {/* ── WIZARD ── */}
                {assessStep === "wizard" && dims.length > 0 && (() => {
                  const dim = dims[wizStep];
                  const pLabel = personas.find(p => p.id === persona)?.label || "";
                  return (
                    <div>
                      <div className="wiz-head">
                        <div className="wiz-meta">
                          <div className="wiz-title">{pLabel} Assessment</div>
                          <div className="wiz-prog-lbl">{answered} / {dims.length} answered</div>
                        </div>
                        <div className="wiz-bar"><div className="wiz-fill" style={{ width: `${(answered / dims.length) * 100}%` }} /></div>
                        <div className="wiz-dots">
                          {dims.map((d, i) => {
                            const done = !!scores[d.id];
                            const cls = i === wizStep ? "act" : done ? "done" : "todo";
                            return <button key={d.id} className={`wdot ${cls}`} onClick={() => setWizStep(i)}>{done && i !== wizStep ? "✓" : i + 1}</button>;
                          })}
                        </div>
                      </div>
                      <div className="dim-card">
                        <div className="dim-hd"><span className="dim-icon">{dim.icon}</span><span className="dim-name">{dim.name}</span></div>
                        <div className="dim-q">{dim.q}</div>
                        {dim.levels.map((lv) => (
                          <button key={lv.s} className={`lv${scores[dim.id] === lv.s ? " sel" : ""}`}
                            onClick={() => pickLevel(dim.id, lv.s)}>
                            <div className="lv-num" style={scores[dim.id] === lv.s ? { background: "var(--g)", color: "#fff" } : {}}>{lv.s}</div>
                            <div><div className="lv-lbl">{lv.l}</div><div className="lv-detail">{lv.d}</div></div>
                          </button>
                        ))}
                      </div>
                      <div className="wiz-nav">
                        <button className="btn-ghost" disabled={wizStep === 0} onClick={() => setWizStep(w => Math.max(0, w - 1))}>← Previous</button>
                        <div style={{ display: "flex", gap: 10 }}>
                          {wizStep < dims.length - 1 && <button className="btn-ghost" disabled={!scores[dim.id]} onClick={() => setWizStep(w => w + 1)}>Next →</button>}
                          {wizStep === dims.length - 1 && (
                            <button
                              className="btn-results"
                              disabled={answered < dims.length || isGenerating}
                              onClick={generateResults}
                            >
                              {isGenerating ? "Generating Report..." : "See My Results ✓"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* ════ RESULTS ════ */}
            {view === "results" && totalScore > 0 && data && (() => {
              const circ = 283;
              const pct = totalScore / 100;
              const steps = getNextSteps(totalScore, persona || "business", data.nextSteps);
              return (
                <>
                  <section className="res-hdr" aria-labelledby="results-heading">
                    <div className="res-hdr-inner">
                      <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", opacity: .6, marginBottom: 6 }}>Algoleap · Agentforce Readiness Report</p>
                      <h2 id="results-heading" style={{ fontSize: 25, fontWeight: 800 }}>Your Personalised Readiness Report</h2>
                      {user && <p style={{ fontSize: 13, opacity: .75, marginTop: 4 }}>{user.firstName} {user.lastName} · {user.company} · {user.detailsId}</p>}
                    </div>
                  </section>
                  <div className="res-wrap">
                    {/* Score summary */}
                    <div className="res-card">
                      <div className="score-row">
                        <div className="score-svg-wrap">
                          <svg viewBox="0 0 116 116" width="116" height="116" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="58" cy="58" r="46" fill="none" stroke="#eee" strokeWidth="9" />
                            <circle cx="58" cy="58" r="46" fill="none" stroke={tier.color} strokeWidth="9"
                              strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
                              style={{ transition: "stroke-dasharray .8s ease" }} />
                          </svg>
                          <div className="score-inner">
                            <span className="score-n" style={{ color: tier.color }}>{Math.round(totalScore)}</span>
                            <span className="score-of">of 100</span>
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <span className="tier-badge" style={{ background: tier.bg, color: tier.color }}>{tier.label}</span>
                          <p className="tier-desc">{getTierDesc(totalScore, persona || "business", data.tierDescriptions)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dimension breakdown */}
                    <article className="res-card" aria-labelledby="dim-breakdown-heading">
                      <h3 id="dim-breakdown-heading" className="res-card-title">📊 Dimension Breakdown</h3>
                      {dims.map((dim) => {
                        const s = scores[dim.id] || 0;
                        const lv = dim.levels.find((l) => l.s === s);
                        const next = dim.levels.find((l) => l.s === s + 1);
                        const c = s >= 4 ? "#2D7A3A" : s >= 3 ? "#D4930D" : "#C62828";
                        return (
                          <div key={dim.id} className="dim-row-wrap" onClick={() => setExpandedDim(expandedDim === dim.id ? null : dim.id)}>
                            <div className="dim-row">
                              <div className="dim-row-top">
                                <span className="dim-row-name">{dim.icon} {dim.name}</span>
                                <span className="dim-row-score" style={{ color: c }}>{lv?.l} &nbsp;{s}/5</span>
                              </div>
                              <div className="dim-bar"><div className="dim-fill" style={{ width: `${(s / 5) * 100}%`, background: c }} /></div>
                              <div className={`dim-expand${expandedDim === dim.id ? " open" : ""}`}>
                                <strong>Current:</strong> {lv?.d}<br />
                                {next ? <><strong>Next level:</strong> {next.d}</> : <strong>🏆 Maximum level achieved</strong>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </article>

                    {/* Next steps */}
                    <article className="res-card" aria-labelledby="next-steps-heading">
                      <h3 id="next-steps-heading" className="res-card-title">🗺️ Recommended Next Steps</h3>
                      {steps.map((step, i) => (
                        <div key={i} className="ns-item">
                          <div className="ns-num">{i + 1}</div>
                          <div><div className="ns-title">{step.t}</div><div className="ns-desc">{step.d}</div></div>
                        </div>
                      ))}
                    </article>

                    <div style={{ textAlign: "center", marginTop: 40 }}>
                      <button onClick={() => navTo("landing")}
                        style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "#fff", fontSize: 12, fontWeight: 600, color: "var(--sub)", cursor: "pointer" }}>
                        Retake Assessment
                      </button>
                      <p style={{ fontSize: 11, color: "#bbb", marginTop: 12 }}>Agentforce Readiness Scorecard v2.0 · Algoleap Salesforce Practice</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </main>

          <footer role="contentinfo">
            <p><strong>Algoleap</strong> · Agentforce Readiness Scorecard · © 2026 Algoleap. All rights reserved.</p>
          </footer>
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* User Details Modal */}
      <div className={`overlay${showUserModal ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setShowUserModal(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-user-title">
        <div className="modal modal-wide">
          <button className="modal-x" onClick={() => setShowUserModal(false)} aria-label="Close dialog">✕</button>
          <h2 id="modal-user-title">Let&apos;s Get Started</h2>
          <div className="modal-sub">We&apos;ll personalise your results and send your PDF report. Only email is required.</div>
          <div className="frow">
            <div className="fg"><label>First Name <span className="req">*</span></label><input placeholder="Jane" value={formData.uFirst || ''} onChange={e => setFormData((p: any) => ({ ...p, uFirst: e.target.value }))} /></div>
            <div className="fg"><label>Last Name <span className="req">*</span></label><input placeholder="Smith" value={formData.uLast || ''} onChange={e => setFormData((p: any) => ({ ...p, uLast: e.target.value }))} /></div>
          </div>
          <div className="fg"><label>Work Email <span className="req">*</span></label><input type="email" placeholder="jane@company.com" value={formData.uEmail || ''} onChange={e => setFormData((p: any) => ({ ...p, uEmail: e.target.value }))} /></div>
          <div className="frow">
            <div className="fg"><label>Company</label><input placeholder="Acme Corp" value={formData.uCompany || ''} onChange={e => setFormData((p: any) => ({ ...p, uCompany: e.target.value }))} /></div>
            <div className="fg"><label>Job Title</label><input placeholder="VP Sales" value={formData.uTitle || ''} onChange={e => setFormData((p: any) => ({ ...p, uTitle: e.target.value }))} /></div>
          </div>
          <div className="fg"><label>Phone (Optional)</label><input type="tel" placeholder="+1 555 000 0000" value={formData.uPhone || ''} onChange={e => setFormData((p: any) => ({ ...p, uPhone: e.target.value }))} /></div>

          {/* ── Persona Selection (compact blocks) ── */}
          <div className="persona-section-modal">
            <label>Select Your Role <span className="req">*</span></label>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 10px' }}>This tailors the assessment to your perspective.</p>
            <div className="persona-blocks">
              {personas.map(p => (
                <div
                  key={p.id}
                  className={`persona-block${persona === p.id ? " selected" : ""}`}
                  style={{
                    borderColor: persona === p.id ? p.color : undefined,
                    background: persona === p.id ? p.bg : undefined,
                  }}
                  onClick={() => setPersona(p.id)}
                >
                  <span className="persona-block-icon">{p.icon}</span>
                  <div className="persona-block-info">
                    <div className="persona-block-label">{p.label}</div>
                    <div className="persona-block-sub" style={{ color: persona === p.id ? p.color : 'var(--muted)' }}>{p.sub}</div>
                  </div>
                  {persona === p.id && <span className="persona-block-check">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <button id="btn-submit-user" className="btn-primary" onClick={submitUser} aria-label="Submit details and start assessment">Start My Assessment →</button>
          <div className="form-note">🔒 Never shared. Unsubscribe any time.</div>
        </div>
      </div>

      {/* Book Diagnostic Modal */}
      <div className={`overlay${showBookModal ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setShowBookModal(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-book-title">
        <div className="modal">
          <button className="modal-x" onClick={() => setShowBookModal(false)} aria-label="Close booking dialog">✕</button>
          <h2 id="modal-book-title">Book a Free Diagnostic</h2>
          <div className="modal-sub">30 minutes with an Algoleap consultant. Architecture review, data profiling, and a prioritised roadmap.</div>
          <div className="frow">
            <div className="fg"><label>Name <span className="req">*</span></label><input placeholder="Jane Smith" onChange={e => setFormData((p: any) => ({ ...p, bName: e.target.value }))} /></div>
            <div className="fg"><label>Work Email <span className="req">*</span></label><input type="email" placeholder="jane@company.com" onChange={e => setFormData((p: any) => ({ ...p, bEmail: e.target.value }))} /></div>
          </div>
          <div className="frow">
            <div className="fg"><label>Company</label><input placeholder="Acme Corp" onChange={e => setFormData((p: any) => ({ ...p, bCo: e.target.value }))} /></div>
            <div className="fg"><label>Phone</label><input placeholder="+1 555 000" onChange={e => setFormData((p: any) => ({ ...p, bPhone: e.target.value }))} /></div>
          </div>
          <div style={{ background: "#f7f9f6", borderRadius: 10, padding: 16, margin: "12px 0", textAlign: "center", border: "1px dashed #c8dcc5" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gd)", marginBottom: 4 }}>📅 Calendly Booking</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>calendly.com/algoleap/diagnostic would embed here</div>
          </div>
          <button className="btn-primary" onClick={() => submitLead("book")}>Confirm Booking →</button>
        </div>
      </div>

      {/* Email Report Modal */}
      <div className={`overlay${showPdfModal ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setShowPdfModal(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-pdf-title">
        <div className="modal">
          <button className="modal-x" onClick={() => setShowPdfModal(false)} aria-label="Close PDF report dialog">✕</button>
          <h2 id="modal-pdf-title">Get Your PDF Report</h2>
          <div className="modal-sub">We&apos;ll email you a detailed breakdown of your scores, dimension insights, and recommended next steps.</div>
          <div className="frow">
            <div className="fg"><label>Name <span className="req">*</span></label><input placeholder="Jane Smith" onChange={e => setFormData((p: any) => ({ ...p, pName: e.target.value }))} /></div>
            <div className="fg"><label>Work Email <span className="req">*</span></label><input type="email" placeholder="jane@company.com" onChange={e => setFormData((p: any) => ({ ...p, pEmail: e.target.value }))} /></div>
          </div>
          <div className="fg"><label>Company</label><input placeholder="Acme Corp" onChange={e => setFormData((p: any) => ({ ...p, pCo: e.target.value }))} /></div>
          <button className="btn-primary" onClick={() => submitLead("pdf")}>Email Me the Report →</button>
          <div className="form-note">Your report will arrive within 60 seconds.</div>
        </div>
      </div>

      {/* Share Modal */}
      <div className={`overlay share-modal${showShareModal ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setShowShareModal(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-share-title">
        <div className="modal">
          <button className="modal-x" onClick={() => setShowShareModal(false)} aria-label="Close sharing dialog">✕</button>
          <h2 id="modal-share-title">Share Your Results</h2>
          <div className="modal-sub">Share your Agentforce readiness score with your team or on social media.</div>
          <div className="share-score-display">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--muted)", marginBottom: 6 }}>Agentforce Readiness Score</div>
            <div className="share-big-score" style={{ color: tier.color }}>{Math.round(totalScore)}/100</div>
            <div className="share-big-tier" style={{ color: tier.color }}>{tier.label}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", marginBottom: 10, textTransform: "uppercase", letterSpacing: .5 }}>Share on</div>
          <div className="share-platforms">
            <button className="share-btn sb-li" onClick={() => shareOn("linkedin")}><div className="sbi">in</div><span>LinkedIn</span></button>
            <button className="share-btn sb-x" onClick={() => shareOn("twitter")}><div className="sbi" style={{ fontSize: 13, fontWeight: 900 }}>𝕏</div><span>X / Twitter</span></button>
            <button className="share-btn sb-wa" onClick={() => shareOn("whatsapp")}><div className="sbi">💬</div><span>WhatsApp</span></button>
            <button className="share-btn sb-em" onClick={() => shareOn("email")}><div className="sbi">✉️</div><span>Email</span></button>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Or copy link</div>
          <div className="copy-row">
            <input className="copy-input" readOnly value={buildShareUrl()} />
            <button className="copy-btn" onClick={copyLink}>Copy</button>
          </div>
          <div className="copy-success" style={{ opacity: copyOk ? 1 : 0 }}>✅ Link copied to clipboard!</div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toastOn ? " on" : ""}`} role="alert" aria-live="polite">{toastMsg}</div>
    </>
  );
}
