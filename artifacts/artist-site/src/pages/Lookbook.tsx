import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/* ── Image helpers ─────────────────────────────────────────────── */

// Existing high-res editorial shots (7 originals, 1800px)
const ED = {
  spread:    "/lookbook/05-magazine-spread",
  alley:     "/lookbook/02-alley",
  portrait:  "/lookbook/04-portrait",
  charCard:  "/lookbook/03-character-card",
  diner:     "/lookbook/07-diner",
  skatepark: "/lookbook/01-skatepark",
  collage:   "/lookbook/06-collage",
};

// New zine shots (35 new images, 1024px)
const Z = (n: number) => `/lookbook/zine-${String(n).padStart(2, "0")}`;

// Srcset for editorial (3 sizes: 600/1200/1800)
const srcset = (base: string) =>
  `${base}-600w.webp 600w, ${base}-1200w.webp 1200w, ${base}.webp 1800w`;

// Srcset for zine shots (3 sizes: 600/1200/1024-full — matches editorial pattern)
const srcsetZ = (n: number) => {
  const base = Z(n);
  return `${base}-600w.webp 600w, ${base}-1200w.webp 1200w, ${base}.webp 1024w`;
};

/* ── IntersectionObserver reveal ───────────────────────────────── */
function useLookbookReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lb-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (i: number) => (el: HTMLElement | null) => { refs.current[i] = el; };
}

/* ── Tape strip helper ─────────────────────────────────────────── */
function Tape({ cls }: { cls: string }) {
  return <div className={`zine-tape ${cls}`} aria-hidden />;
}

/* ── Inline CSS ────────────────────────────────────────────────── */
const LOOKBOOK_CSS = `
  @keyframes lbFadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes lbDividerGrow {
    from { transform:scaleX(0); }
    to   { transform:scaleX(1); }
  }
  @keyframes lb2026Glitch {
    0%,88%,100% { filter:none; transform:none; }
    90% { filter:drop-shadow(-3px 0 #ff1a8c) drop-shadow(3px 0 #ff4d4d); transform:skewX(-1.5deg); }
    92% { filter:drop-shadow(2px 0 #00ffcc)  drop-shadow(-2px 0 #ff1a8c); transform:skewX(1deg); }
    94% { filter:none; transform:none; }
    96% { filter:drop-shadow(-2px 0 #ff1a8c); transform:skewX(-0.5deg); }
    98% { filter:none; transform:none; }
  }
  @keyframes zineFlicker {
    0%  { opacity:.72; }
    40% { opacity:.55; }
    70% { opacity:.8; }
    100%{ opacity:.72; }
  }

  /* Hero entrance */
  .lb-hero-word { opacity:0; transform:translateY(20px); }
  .lb-hero-word.lb-in { animation:lbFadeUp .65s cubic-bezier(.22,1,.36,1) forwards; }
  .lb-divider-line { transform-origin:left center; transform:scaleX(0); }
  .lb-divider-line.lb-in { animation:lbDividerGrow .7s cubic-bezier(.22,1,.36,1) forwards; }
  .lb-2026 { display:inline-block; animation:lb2026Glitch 5s infinite; }
  .lb-title-ghost {
    position:absolute; inset:0;
    color:#ff1a8c; opacity:.22;
    transform:translate(4px,4px);
    pointer-events:none; user-select:none;
    font-family:var(--font-elite); letter-spacing:.04em;
    text-transform:uppercase; line-height:1;
  }

  /* Header */
  .lb-header { opacity:0; animation:lbFadeUp .5s ease .05s forwards; }

  /* Back button */
  .lb-back-arrow { display:inline-block; transition:transform .2s ease; }
  .lb-back-btn:hover .lb-back-arrow { transform:translateX(-4px); }

  /* Scroll reveal */
  .lb-reveal { opacity:0; transform:translateY(18px); transition:opacity .55s ease-out,transform .55s ease-out; }
  .lb-reveal.lb-visible { opacity:1; transform:translateY(0); }
  .lb-d1 { transition-delay:80ms; }
  .lb-d2 { transition-delay:160ms; }
  .lb-d3 { transition-delay:240ms; }

  /* ── Zine: tape strips ── */
  .zine-tape {
    position:absolute; width:58px; height:20px;
    background:rgba(255,238,130,.46); z-index:20; pointer-events:none;
  }
  .zt-tl { top:-9px;  left:20px;  transform:rotate(-4deg); }
  .zt-tr { top:-9px;  right:20px; transform:rotate(6deg); }
  .zt-bl { bottom:-9px; left:24px; transform:rotate(3deg); }
  .zt-br { bottom:-9px; right:14px; transform:rotate(-5deg); }
  .zt-tc { top:-9px;  left:42%; transform:rotate(-2deg); }

  /* ── Zine: torn edges (clip-path) ── */
  .zine-torn-b {
    clip-path:polygon(
      0 0,100% 0,100% 90%,
      96% 94%,92% 91%,88% 95%,84% 92%,
      80% 96%,76% 93%,72% 97%,68% 94%,
      64% 98%,60% 95%,56% 99%,52% 96%,
      48% 100%,44% 97%,40% 100%,36% 96%,
      32% 99%,28% 95%,24% 98%,20% 94%,
      16% 97%,12% 93%,8% 96%,4% 92%,0 95%
    );
  }
  .zine-torn-t {
    clip-path:polygon(
      0 8%,4% 4%,8% 7%,12% 3%,16% 6%,
      20% 2%,24% 5%,28% 1%,32% 4%,36% 0,
      40% 3%,44% 0%,48% 3%,52% 0%,
      56% 3%,60% 1%,64% 4%,68% 0,
      72% 3%,76% 0%,80% 3%,84% 0%,
      88% 3%,92% 1%,96% 4%,100% 0%,
      100% 100%,0 100%
    );
  }

  /* ── Zine: white photo border (print frame) ── */
  .zine-frame {
    border:10px solid #ede8de;
    box-shadow:4px 5px 18px rgba(0,0,0,.65);
  }
  .zine-frame-lg {
    border:14px solid #ede8de;
    border-bottom:40px solid #ede8de;
    box-shadow:6px 8px 22px rgba(0,0,0,.7);
  }

  /* ── Zine: rubber stamp ── */
  .zine-stamp {
    position:absolute;
    font-family:var(--font-elite);
    letter-spacing:.15em;
    text-transform:uppercase;
    color:rgba(210,38,38,.72);
    border:3px solid rgba(210,38,38,.62);
    padding:4px 14px;
    pointer-events:none;
    z-index:10;
    animation:zineFlicker 3.5s ease-in-out infinite;
  }

  /* ── Zine: handwritten scrawl ── */
  .zine-scrawl {
    font-family:var(--font-marker);
    color:rgba(255,255,255,.68);
    line-height:1.2;
    pointer-events:none;
  }

  /* ── Zine: typed caption ── */
  .zine-cap {
    font-family:var(--font-elite);
    font-size:9px;
    letter-spacing:.28em;
    text-transform:uppercase;
    color:rgba(255,255,255,.42);
  }

  /* ── Zine: sticker label ── */
  .zine-label {
    display:inline-block;
    font-family:var(--font-elite);
    font-size:9px;
    letter-spacing:.3em;
    text-transform:uppercase;
    background:#ff1a8c;
    color:#fff;
    padding:3px 10px;
  }

  /* ── Zine: contact strip (no gap) ── */
  .zine-strip { display:flex; gap:0; }
  .zine-strip>* { flex:1; min-width:0; }

  /* ── Zine: freeform absolute container ── */
  .zine-freeform {
    position:relative;
    width:100%;
    height:900px;
    overflow:hidden;
  }
  @media(max-width:767px) {
    .zine-freeform {
      position:static; height:auto; overflow:visible;
      display:flex; flex-direction:column; gap:12px;
    }
    .zine-freeform>* {
      position:static!important; width:100%!important;
      left:auto!important; top:auto!important;
    }
  }

  /* ── Zine: ripped paper divider ── */
  .zine-rip {
    height:28px;
    background:#0a0a0a;
    clip-path:polygon(
      0 0,100% 0,100% 55%,
      96% 65%,93% 48%,89% 68%,
      85% 52%,81% 70%,77% 55%,
      73% 68%,69% 50%,65% 65%,
      61% 48%,57% 62%,53% 50%,
      49% 65%,45% 52%,41% 68%,
      37% 55%,33% 70%,29% 52%,
      25% 65%,21% 48%,17% 62%,
      13% 50%,9% 65%,5% 48%,
      0 58%
    );
    margin:-1px 0;
  }

  /* ── Img helper ── */
  .zi { width:100%; display:block; }
  .zi-cover { width:100%; height:100%; object-fit:cover; display:block; }

  /* ══ Mobile (≤767px) fixes ══════════════════════════════════════ */
  @media(max-width:767px) {

    /* Hard-stop any overflow caused by rotated elements */
    .lb-page-root { overflow-x:hidden; }

    /* Hero image — reduce rotation so it doesn't clip */
    .lb-hero-rot { transform:rotate(0.6deg) !important; margin:0 !important; }

    /* Freeform (Section 6) — clear all child transforms & spacing */
    .zine-freeform > * {
      transform:none !important;
      margin-top:0 !important;
      margin-left:0 !important;
      z-index:auto !important;
    }

    /* Contact strip — 2 across instead of 4 cramped */
    .zine-strip { flex-wrap:wrap !important; }
    .zine-strip > * { flex:0 0 50% !important; }

    /* Scattered-opener overflow extra — don't let it bleed right */
    .lb-scatter-extra {
      width:55% !important;
      margin-top:6px !important;
      transform:rotate(2deg) !important;
    }

    /* Grid-mess bleed — remove negative left margin on mobile */
    .lb-bleed-left { margin-left:0 !important; }

    /* "the reference" label — keep it on-screen */
    .lb-ref-label { margin-left:30% !important; }

    /* Closing collage corner — larger, less tilt, less overlap */
    .lb-closing-corner {
      width:38% !important;
      margin-top:-18px !important;
      transform:rotate(3deg) !important;
    }

    /* Stamps — scale down for narrow cards */
    .zine-stamp { font-size:.6rem !important; padding:3px 7px !important; letter-spacing:.1em !important; }

    /* Scrawl — cap font size */
    .zine-scrawl { font-size:11px !important; }

    /* Tape — slightly smaller */
    .zine-tape { width:44px !important; height:15px !important; }

    /* zine-frame borders thinner on mobile */
    .zine-frame { border-width:6px !important; }
    .zine-frame-lg { border-width:8px !important; border-bottom-width:24px !important; }
  }

  /* ── Reduced motion ── */
  @media(prefers-reduced-motion:reduce) {
    .lb-hero-word,.lb-hero-word.lb-in,
    .lb-divider-line,.lb-divider-line.lb-in,
    .lb-2026,.lb-reveal,.lb-reveal.lb-visible,
    .lb-header { opacity:1!important; transform:none!important; animation:none!important; transition:none!important; }
    .lb-title-ghost { opacity:.15!important; transform:translate(4px,4px)!important; }
    .zine-stamp { animation:none; }
    .lb-back-arrow { transition:none; }
  }
`;

/* ══════════════════════════════════════════════════════════════════ */
export default function Lookbook() {
  const [, navigate] = useLocation();
  const [heroIn, setHeroIn] = useState(false);
  const reveal = useLookbookReveal();

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const d = [0, 120, 240, 360, 480];

  return (
    <div className="lb-page-root" style={{ background: "#0a0a0a", fontFamily: "var(--font-elite)", overflowX: "hidden" }}>
      <style>{LOOKBOOK_CSS}</style>
      {/* ── Sticky nav ──────────────────────────────────────────── */}
      <header className="lb-header sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,26,140,0.18)" }}>
        <button onClick={() => navigate("/")}
          className="lb-back-btn flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase"
          style={{ color: "rgba(255,255,255,0.45)", transition: "color 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff1a8c")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}>
          <span className="lb-back-arrow">←</span> ashjo.com
        </button>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#ff1a8c" }}>Ash Johansen</span>
          <span className="text-[10px] tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
            Summer 2026 Lookbook — Sneak Preview
          </span>
        </div>
        <div style={{ width: "80px" }} />
      </header>
      {/* ── Hero title — badly-registered print ─────────────────── */}
      <section className="px-5 pt-14 pb-6 text-center">
        <p className={`lb-hero-word text-[10px] tracking-[0.45em] uppercase mb-3${heroIn ? " lb-in" : ""}`}
          style={{ color: "rgba(255,26,140,0.7)", animationDelay: `${d[0]}ms` }}>
          Sneak Preview
        </p>
        <div className="relative inline-block">
          {/* Ghost / misregistered layer */}
          <div className="lb-title-ghost text-4xl md:text-6xl lg:text-7xl uppercase leading-none" aria-hidden>
            Summer<br /><span style={{ color: "#ff1a8c" }}>2026</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none mb-4 relative"
            style={{ color: "#fff", letterSpacing: "0.04em" }}>
            <span className={`block lb-hero-word${heroIn ? " lb-in" : ""}`} style={{ animationDelay: `${d[1]}ms` }}>Summer</span>
            <span className={`lb-2026 lb-hero-word${heroIn ? " lb-in" : ""}`}
              style={{ color: "#ff1a8c", animationDelay: `${d[2]}ms` }}>2026</span>
          </h1>
        </div>
        <p className={`lb-hero-word text-xs tracking-[0.3em] uppercase mt-4${heroIn ? " lb-in" : ""}`}
          style={{ color: "rgba(255,255,255,0.3)", animationDelay: `${d[3]}ms` }}>Lookbook</p>
        <div className={`lb-divider-line mx-auto mt-6${heroIn ? " lb-in" : ""}`}
          style={{ height: "2px", width: "80px",
            background: "repeating-linear-gradient(90deg,#ff1a8c 0,#ff1a8c 6px,transparent 6px,transparent 12px)",
            boxShadow: "0 0 12px rgba(255,26,140,0.5)", animationDelay: `${d[4]}ms` }} />
      </section>
      {/* ══ 1. HERO IMAGE — zine-34 (big hero shot), tilted ═══════ */}
      <div ref={reveal(0) as React.Ref<HTMLDivElement>}
        className="lb-reveal lb-hero-rot relative"
        style={{ margin: "0 -10px", transform: "rotate(1.4deg)", transformOrigin: "left center", zIndex: 2 }}>
        <div className="zine-frame-lg" style={{ position: "relative", overflow: "hidden" }}>
          <Tape cls="zt-tl" />
          <Tape cls="zt-tr" />
          <img src={`${Z(34)}.webp`} srcSet={srcsetZ(34)} sizes="100vw"
            alt="Ash Johansen 2026" className="zi"
            style={{ maxHeight: "82vh", objectFit: "cover", objectPosition: "top center" }} />
          <div className="zine-stamp" style={{ top: "14%", right: "7%", fontSize: "1.5rem", transform: "rotate(-27deg)" }}>
            SUMMER 2026
          </div>
          <div className="zine-scrawl" style={{ position: "absolute", bottom: "18px", left: "20px", fontSize: "15px", transform: "rotate(-2deg)" }}>
            → fave
          </div>
        </div>
      </div>
      {/* ══ 2. SCATTERED OPENER — 3 images, chaotic ═══════════════ */}
      <div className="relative px-2 md:px-3 mt-4">
        <div style={{ transform: "rotate(-3.5deg)", display: "inline-block", marginBottom: "10px", marginLeft: "6px" }}>
          <span className="zine-label">the look</span>
        </div>
        <div className="grid grid-cols-3 gap-1 items-end">
          {/* Left — large */}
          <div ref={reveal(1) as React.Ref<HTMLDivElement>}
            className="lb-reveal col-span-2"
            style={{ position: "relative", transform: "rotate(-1.8deg)", transformOrigin: "bottom left" }}>
            <Tape cls="zt-tl" />
            <div className="zine-torn-b">
              <img src={`${Z(1)}.webp`} srcSet={srcsetZ(1)} sizes="60vw" alt="" className="zi" />
            </div>
            <div className="zine-scrawl" style={{ position: "absolute", bottom: "-20px", left: "8px", fontSize: "13px", transform: "rotate(-1.5deg)" }}>street</div>
          </div>
          {/* Right — two stacked */}
          <div className="flex flex-col gap-1">
            <div ref={reveal(2) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d1"
              style={{ position: "relative", transform: "rotate(4deg)" }}>
              <img src={`${Z(2)}.webp`} srcSet={srcsetZ(2)} sizes="30vw" alt="" className="zi" />
              <Tape cls="zt-tr" />
            </div>
            <div ref={reveal(3) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d2"
              style={{ position: "relative", transform: "rotate(-2.5deg)", marginTop: "-20px", zIndex: 3 }}>
              <img src={`${Z(3)}.webp`} srcSet={srcsetZ(3)} sizes="30vw" alt="" className="zi" />
              <div className="zine-cap" style={{ position: "absolute", bottom: "6px", right: "6px" }}>03</div>
            </div>
          </div>
        </div>
        {/* Overflow extra below-right */}
        <div ref={reveal(4) as React.Ref<HTMLDivElement>}
          className="lb-reveal lb-d3 lb-scatter-extra"
          style={{ width: "40%", marginLeft: "auto", position: "relative", transform: "rotate(4.5deg)", marginTop: "-28px", zIndex: 5 }}>
          <div className="zine-frame" style={{ position: "relative" }}>
            <img src={`${Z(4)}.webp`} srcSet={srcsetZ(4)} sizes="40vw" alt="" className="zi" />
          </div>
          <div className="zine-scrawl" style={{ position: "absolute", bottom: "-20px", right: "8px", fontSize: "12px", transform: "rotate(2deg)" }}>omg yes</div>
        </div>
      </div>
      {/* Drifting page number */}
      <div style={{ textAlign: "right", paddingRight: "16px", marginTop: "30px" }}>
        <span style={{ fontFamily: "var(--font-elite)", fontSize: "10px", color: "rgba(255,255,255,0.15)", transform: "rotate(90deg)", display: "inline-block" }}>p.02</span>
      </div>
      {/* ══ 3. CONTACT STRIP — 4 images touching, no gap ══════════ */}
      <div ref={reveal(5) as React.Ref<HTMLDivElement>}
        className="lb-reveal mt-6"
        style={{ transform: "rotate(-0.9deg)", overflow: "hidden" }}>
        <div className="zine-strip">
          {([5, 6, 7, 8] as const).map((n, i) => (
            <div key={n} style={{ position: "relative", flex: 1, transform: `rotate(${[1.4, -0.9, 1.6, -1.3][i]}deg)` }}>
              <img src={`${Z(n)}.webp`} srcSet={srcsetZ(n)} sizes="25vw" alt="" className="zi-cover" style={{ aspectRatio: "1/1" }} />
            </div>
          ))}
        </div>
        <div className="zine-cap" style={{ textAlign: "center", marginTop: "5px", opacity: 0.5 }}>contact sheet — summer sessions</div>
      </div>
      {/* ══ 4. BADASH STAMP TEXT BREAK ════════════════════════════ */}
      <div className="py-12 px-6 text-center relative" style={{ overflow: "hidden" }}>
        <div style={{ transform: "rotate(-3.8deg)", display: "inline-block", position: "relative" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem,13vw,8.5rem)",
            color: "#ff1a8c", letterSpacing: ".04em", textTransform: "uppercase", lineHeight: 1,
            textShadow: "5px 5px 0 rgba(255,26,140,.18), -3px -3px 0 rgba(0,0,0,.9)" }}>ASHJO</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem,13vw,8.5rem)",
            color: "rgba(200,30,30,.14)", letterSpacing: ".04em", textTransform: "uppercase", lineHeight: 1,
            position: "absolute", inset: 0, transform: "translate(6px,5px)", pointerEvents: "none" }} aria-hidden>
            BADASH
          </div>
        </div>
        <div className="zine-scrawl" style={{ fontSize: "15px", marginTop: "10px", transform: "rotate(1.5deg)", opacity: .55 }}>
          i do what i want, when i want
        </div>
        <div style={{ marginTop: "14px" }}>
          <span className="zine-label" style={{ transform: "rotate(2.5deg)", display: "inline-block" }}>summer 2026</span>
        </div>
      </div>
      {/* ══ 5. EDITORIAL SPREAD + SIDEBAR ═════════════════════════ */}
      <div className="px-2 md:px-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
          <div ref={reveal(6) as React.Ref<HTMLDivElement>}
            className="lb-reveal md:col-span-2"
            style={{ position: "relative", transform: "rotate(-1.6deg)", transformOrigin: "top right" }}>
            <Tape cls="zt-tl" />
            <div className="zine-torn-t">
              <img src={`${ED.spread}.webp`} srcSet={srcset(ED.spread)}
                sizes="(min-width:768px) 66vw, 100vw" alt="Ash Johansen Summer 2026 Lookbook — Magazine Spread" className="zi" />
            </div>
            <div className="zine-cap" style={{ marginTop: "5px", paddingLeft: "6px" }}>editorial spread · the look</div>
          </div>
          <div className="flex flex-col gap-2">
            <div ref={reveal(7) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d1"
              style={{ position: "relative", transform: "rotate(4deg)", marginTop: "28px" }}>
              <div className="zine-frame">
                <img src={`${Z(9)}.webp`} srcSet={srcsetZ(9)} sizes="30vw" alt="" className="zi" />
              </div>
            </div>
            <div ref={reveal(8) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d2"
              style={{ position: "relative", transform: "rotate(-2.5deg)", marginTop: "-12px", zIndex: 3 }}>
              <img src={`${Z(10)}.webp`} srcSet={srcsetZ(10)} sizes="30vw" alt="" className="zi" />
              <div className="zine-scrawl" style={{ position: "absolute", bottom: "-18px", left: "6px", fontSize: "12px", transform: "rotate(-1deg)" }}>!!!</div>
            </div>
          </div>
        </div>
      </div>
      {/* Ripped divider */}
      <div className="zine-rip" />
      {/* ══ 6. FREEFORM OVERLAP — true collage chaos ═══════════════ */}
      <div style={{ paddingLeft: "8px", marginTop: "6px" }}>
        <div style={{ transform: "rotate(2.5deg)", display: "inline-block", marginLeft: "32%" }}>
          <span className="zine-label">the vibe</span>
        </div>
      </div>
      <div ref={reveal(9) as React.Ref<HTMLDivElement>}
        className="lb-reveal zine-freeform"
        style={{ margin: "6px 4px 0" }}>
        <div style={{ position: "absolute", top: "0", left: "1%", width: "38%", transform: "rotate(-3.2deg)", zIndex: 5 }}>
          <div className="zine-frame-lg" style={{ position: "relative" }}>
            <Tape cls="zt-tl" />
            <img src={`${Z(11)}.webp`} srcSet={srcsetZ(11)} sizes="38vw" alt="" className="zi" />
          </div>
        </div>
        <div style={{ position: "absolute", top: "30px", left: "30%", width: "36%", transform: "rotate(5deg)", zIndex: 7 }}>
          <div className="zine-torn-b" style={{ position: "relative" }}>
            <Tape cls="zt-tc" />
            <img src={`${Z(12)}.webp`} srcSet={srcsetZ(12)} sizes="36vw" alt="" className="zi" />
          </div>
        </div>
        <div style={{ position: "absolute", top: "15px", left: "60%", width: "40%", transform: "rotate(-2.2deg)", zIndex: 4 }}>
          <div className="zine-frame" style={{ position: "relative" }}>
            <img src={`${Z(13)}.webp`} srcSet={srcsetZ(13)} sizes="40vw" alt="" className="zi" />
            <div className="zine-stamp" style={{ top: "10px", left: "8px", fontSize: ".8rem", transform: "rotate(-18deg)" }}>badash</div>
          </div>
        </div>
        <div style={{ position: "absolute", top: "360px", left: "3%", width: "44%", transform: "rotate(2.8deg)", zIndex: 6 }}>
          <div className="zine-torn-t" style={{ position: "relative" }}>
            <img src={`${Z(14)}.webp`} srcSet={srcsetZ(14)} sizes="44vw" alt="" className="zi" />
          </div>
          <div className="zine-scrawl" style={{ marginTop: "6px", fontSize: "14px", transform: "rotate(1.5deg)" }}>attitude</div>
        </div>
        <div style={{ position: "absolute", top: "390px", left: "39%", width: "32%", transform: "rotate(-5.5deg)", zIndex: 8 }}>
          <div className="zine-frame" style={{ position: "relative" }}>
            <Tape cls="zt-tr" />
            <img src={`${Z(15)}.webp`} srcSet={srcsetZ(15)} sizes="32vw" alt="" className="zi" />
          </div>
        </div>
        <div style={{ position: "absolute", top: "310px", left: "62%", width: "36%", transform: "rotate(6.5deg)", zIndex: 3 }}>
          <div style={{ position: "relative" }}>
            <img src={`${Z(16)}.webp`} srcSet={srcsetZ(16)} sizes="36vw" alt="" className="zi" />
            <div className="zine-scrawl" style={{ position: "absolute", top: "-20px", right: "8px", fontSize: "13px", transform: "rotate(3deg)" }}>→ this one</div>
          </div>
        </div>
      </div>
      {/* ══ 7. GRID MESS — 2×2, one breaks out ════════════════════ */}
      <div className="px-3 md:px-4 mt-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div ref={reveal(10) as React.Ref<HTMLDivElement>}
            className="lb-reveal"
            style={{ position: "relative", transform: "rotate(-4.2deg)", transformOrigin: "top left" }}>
            <img src={`${Z(17)}.webp`} srcSet={srcsetZ(17)} sizes="50vw" alt="" className="zi" />
            <Tape cls="zt-tl" />
          </div>
          <div ref={reveal(11) as React.Ref<HTMLDivElement>}
            className="lb-reveal lb-d1"
            style={{ position: "relative", transform: "rotate(3.2deg)", marginTop: "22px" }}>
            <div className="zine-torn-b">
              <img src={`${Z(18)}.webp`} srcSet={srcsetZ(18)} sizes="50vw" alt="" className="zi" />
            </div>
          </div>
          {/* Bottom-left: bleeds into gutter */}
          <div ref={reveal(12) as React.Ref<HTMLDivElement>}
            className="lb-reveal lb-d2 lb-bleed-left"
            style={{ position: "relative", transform: "rotate(1.8deg)", marginLeft: "-18px", marginTop: "-16px", zIndex: 5 }}>
            <div className="zine-frame" style={{ position: "relative" }}>
              <img src={`${Z(19)}.webp`} srcSet={srcsetZ(19)} sizes="50vw" alt="" className="zi" />
              <div className="zine-stamp" style={{ bottom: "12px", right: "10px", fontSize: ".75rem", transform: "rotate(15deg)" }}>2026</div>
            </div>
          </div>
          <div ref={reveal(13) as React.Ref<HTMLDivElement>}
            className="lb-reveal lb-d3"
            style={{ position: "relative", transform: "rotate(-2.2deg)" }}>
            <div className="zine-torn-t">
              <img src={`${Z(20)}.webp`} srcSet={srcsetZ(20)} sizes="50vw" alt="" className="zi" />
            </div>
            <div className="zine-cap" style={{ marginTop: "4px", opacity: .55 }}>summer session</div>
          </div>
        </div>
      </div>
      {/* ══ 8. ALLEY + PORTRAIT editorial ══════════════════════════ */}
      <div className="px-2 md:px-3 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div ref={reveal(14) as React.Ref<HTMLDivElement>}
            className="lb-reveal md:col-span-2"
            style={{ position: "relative", transform: "rotate(1.4deg)" }}>
            <Tape cls="zt-bl" />
            <img src={`${ED.alley}.webp`} srcSet={srcset(ED.alley)}
              sizes="(min-width:768px) 66vw, 100vw" alt="Ash Johansen — Graffiti Alley" className="zi" />
            <div className="zine-scrawl" style={{ position: "absolute", bottom: "14px", left: "16px", fontSize: "14px", transform: "rotate(-2deg)" }}>
              street essential
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div ref={reveal(15) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d1"
              style={{ position: "relative", transform: "rotate(-4.5deg)" }}>
              <div className="zine-frame">
                <img src={`${ED.portrait}.webp`} srcSet={srcset(ED.portrait)} sizes="30vw" alt="Ash Johansen Portrait" className="zi" />
              </div>
              <Tape cls="zt-tr" />
              <div className="zine-cap" style={{ marginTop: "4px", textAlign: "center", opacity: .5 }}>the attitude</div>
            </div>
            <div ref={reveal(16) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d2"
              style={{ position: "relative", transform: "rotate(2.8deg)", marginTop: "-10px", zIndex: 3 }}>
              <img src={`${Z(21)}.webp`} srcSet={srcsetZ(21)} sizes="30vw" alt="" className="zi" />
            </div>
          </div>
        </div>
      </div>
      {/* ══ 9. WIDE ROW — 4 images, varied tilts ══════════════════ */}
      <div ref={reveal(17) as React.Ref<HTMLDivElement>}
        className="lb-reveal mt-3 px-1"
        style={{ transform: "rotate(-0.6deg)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {([22, 23, 24, 25] as const).map((n, i) => (
            <div key={n} style={{ position: "relative", transform: `rotate(${[-2.8, 1.9, -1.4, 3.2][i]}deg)`, transformOrigin: i % 2 === 0 ? "bottom left" : "bottom right" }}>
              <img src={`${Z(n)}.webp`} srcSet={srcsetZ(n)} sizes="25vw" alt="" className="zi-cover" style={{ aspectRatio: "1/1" }} />
              {i === 2 && <Tape cls="zt-br" />}
            </div>
          ))}
        </div>
      </div>
      {/* ══ 10. CHARACTER CARD full-bleed ══════════════════════════ */}
      <div className="px-2 md:px-3 mt-5">
        <div className="lb-ref-label" style={{ transform: "rotate(-1.8deg)", display: "inline-block", marginLeft: "58%", marginBottom: "8px" }}>
          <span className="zine-label">the reference</span>
        </div>
        <div ref={reveal(18) as React.Ref<HTMLDivElement>}
          className="lb-reveal"
          style={{ position: "relative", transform: "rotate(.9deg)" }}>
          <div className="zine-torn-b">
            <img src={`${ED.charCard}.webp`} srcSet={srcset(ED.charCard)} sizes="100vw"
              alt="Ash Johansen Summer 2026 — Character Reference" className="zi" />
          </div>
          <div className="zine-stamp" style={{ top: "12%", left: "8%", fontSize: "1rem", transform: "rotate(-20deg)" }}>
            white trash, but make it fashion
          </div>
        </div>
        {/* Row below character card */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {([26, 27] as const).map((n, i) => (
            <div key={n} ref={reveal(19 + i) as React.Ref<HTMLDivElement>}
              className={`lb-reveal lb-d${i + 1}`}
              style={{ position: "relative", transform: `rotate(${[-2.8, 3.6][i]}deg)`, marginTop: `${[0, 18][i]}px` }}>
              <div className={i === 1 ? "zine-frame" : ""}>
                <img src={`${Z(n)}.webp`} srcSet={srcsetZ(n)} sizes="33vw" alt="" className="zi" />
              </div>
              {i === 0 && <Tape cls="zt-tl" />}
            </div>
          ))}
          <div ref={reveal(21) as React.Ref<HTMLDivElement>}
            className="lb-reveal lb-d3"
            style={{ position: "relative", transform: "rotate(-1.8deg)" }}>
            <div className="zine-torn-t">
              <img src={`${ED.skatepark}.webp`} srcSet={srcset(ED.skatepark)} sizes="33vw" alt="Ash Johansen — Skate Park Days" className="zi" />
            </div>
            <div className="zine-scrawl" style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "13px" }}>
              skate park days
            </div>
          </div>
        </div>
      </div>
      {/* Scrawl break */}
      <div style={{ textAlign: "center", padding: "18px 0 6px", transform: "rotate(-1.2deg)" }}>
        <span className="zine-scrawl" style={{ fontSize: "18px", opacity: .4 }}>* * *</span>
      </div>
      {/* ══ 11. CLUSTER CHAOS — 5 images mixed sizes ══════════════ */}
      <div className="px-2 md:px-3 mt-1">
        <div className="grid grid-cols-3 gap-1 items-start">
          <div ref={reveal(22) as React.Ref<HTMLDivElement>}
            className="lb-reveal col-span-2"
            style={{ position: "relative", transform: "rotate(-2.2deg)" }}>
            <div className="zine-torn-b">
              <img src={`${Z(28)}.webp`} srcSet={srcsetZ(28)} sizes="66vw" alt="" className="zi" />
            </div>
            <div className="zine-scrawl" style={{ position: "absolute", top: "12px", left: "14px", fontSize: "14px", transform: "rotate(-3deg)" }}>
              bad decisions
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-6">
            <div ref={reveal(23) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d1"
              style={{ position: "relative", transform: "rotate(5.5deg)" }}>
              <img src={`${Z(29)}.webp`} srcSet={srcsetZ(29)} sizes="33vw" alt="" className="zi" />
              <Tape cls="zt-tl" />
            </div>
            <div ref={reveal(24) as React.Ref<HTMLDivElement>}
              className="lb-reveal lb-d2"
              style={{ position: "relative", transform: "rotate(-3.5deg)", marginTop: "-14px", zIndex: 3 }}>
              <div className="zine-frame">
                <img src={`${Z(30)}.webp`} srcSet={srcsetZ(30)} sizes="33vw" alt="" className="zi" />
              </div>
            </div>
          </div>
        </div>
        {/* Below row */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          {([31, 32, 33] as const).map((n, i) => (
            <div key={n} ref={reveal(25 + i) as React.Ref<HTMLDivElement>}
              className={`lb-reveal lb-d${i + 1}`}
              style={{ position: "relative", transform: `rotate(${[2.8, -4.2, 1.6][i]}deg)`, marginTop: `${[0, 22, -14][i]}px` }}>
              <img src={`${Z(n)}.webp`} srcSet={srcsetZ(n)} sizes="33vw" alt="" className="zi" />
              {i === 1 && <Tape cls="zt-tr" />}
              {i === 2 && <div className="zine-stamp" style={{ top: "8px", left: "6px", fontSize: ".7rem", transform: "rotate(-12deg)" }}>2026</div>}
            </div>
          ))}
        </div>
      </div>
      {/* ══ 12. DINER + ZINE PAIR ══════════════════════════════════ */}
      <div className="px-2 md:px-3 mt-4">
        <div className="grid grid-cols-2 gap-2 items-end">
          <div ref={reveal(28) as React.Ref<HTMLDivElement>}
            className="lb-reveal"
            style={{ position: "relative", transform: "rotate(1.6deg)", transformOrigin: "bottom right" }}>
            <Tape cls="zt-bl" />
            <img src={`${ED.diner}.webp`} srcSet={srcset(ED.diner)} sizes="50vw" alt="Ash Johansen — Diner" className="zi" />
            <div className="zine-cap" style={{ marginTop: "5px", opacity: .55 }}>mood board</div>
          </div>
          <div className="flex flex-col gap-2">
            {([35, 8] as const).map((n, i) => (
              <div key={n} ref={reveal(29 + i) as React.Ref<HTMLDivElement>}
                className={`lb-reveal lb-d${i + 1}`}
                style={{ position: "relative", transform: `rotate(${[-3.8, 4.2][i]}deg)`, marginTop: i === 1 ? "-18px" : "0", zIndex: i === 1 ? 3 : "auto" }}>
                <div className={i === 0 ? "zine-frame" : ""}>
                  <img src={`${Z(n)}.webp`} srcSet={srcsetZ(n)} sizes="50vw" alt="" className="zi" />
                </div>
                {i === 0 && <Tape cls="zt-tr" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Ripped paper divider */}
      <div className="zine-rip mt-6" style={{ transform: "scaleX(-1)" }} />
      {/* ══ 13. CLOSING COLLAGE ════════════════════════════════════ */}
      <div className="px-1 mt-1">
        <div ref={reveal(31) as React.Ref<HTMLDivElement>}
          className="lb-reveal"
          style={{ position: "relative", transform: "rotate(-0.6deg)" }}>
          <div className="zine-torn-t">
            <img src={`${ED.collage}.webp`} srcSet={srcset(ED.collage)} sizes="100vw"
              alt="Ash Johansen Summer 2026 — Closing Collage" className="zi" />
          </div>
          <div className="zine-scrawl" style={{ position: "absolute", bottom: "18px", left: "20px", fontSize: "16px", transform: "rotate(-2.5deg)" }}>
            bad decisions — good times
          </div>
          <div className="zine-stamp" style={{ top: "14%", right: "9%", fontSize: "1.3rem", transform: "rotate(-23deg)" }}>
            APPROVED
          </div>
        </div>
        {/* Corner overflow — zine-35 character art */}
        <div ref={reveal(32) as React.Ref<HTMLDivElement>}
          className="lb-reveal lb-d1 lb-closing-corner"
          style={{ width: "28%", marginLeft: "auto", position: "relative", transform: "rotate(6.5deg)", marginTop: "-44px", zIndex: 5 }}>
          <div className="zine-frame-lg" style={{ position: "relative" }}>
            <img src={`${Z(35)}.webp`} srcSet={srcsetZ(35)} sizes="28vw" alt="" className="zi" />
          </div>
          <Tape cls="zt-tr" />
          <div className="zine-scrawl" style={{ position: "absolute", bottom: "-24px", right: "4px", fontSize: "12px", transform: "rotate(3.5deg)" }}>end.</div>
        </div>
      </div>
      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer ref={reveal(33) as React.Ref<HTMLElement>}
        className="lb-reveal text-center py-14 px-5 mt-10"
        style={{ borderTop: "1px solid rgba(255,26,140,0.12)" }}>
        <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-elite)" }}>
          &copy; Ash Johansen 2026 &mdash; all rights reserved
        </p>
        <p className="text-[10px] tracking-[0.25em] uppercase mt-2 italic" style={{ color: "rgba(255,26,140,0.4)", fontFamily: "var(--font-elite)" }}>
          &ldquo;I do what I want, when I want.&rdquo;
        </p>
      </footer>
    </div>
  );
}
