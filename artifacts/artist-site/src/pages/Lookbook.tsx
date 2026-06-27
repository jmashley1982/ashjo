import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const IMAGES = {
  magazineSpread: "/lookbook/05-magazine-spread.webp",
  alley: "/lookbook/02-alley.webp",
  portrait: "/lookbook/04-portrait.webp",
  characterCard: "/lookbook/03-character-card.webp",
  diner: "/lookbook/07-diner.webp",
  skatepark: "/lookbook/01-skatepark.webp",
  collage: "/lookbook/06-collage.webp",
};

const LOOKBOOK_CSS = `
  /* ── Entrance animations ── */
  @keyframes lbFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lbDividerGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  /* Periodic glitch on "2026" */
  @keyframes lb2026Glitch {
    0%, 88%, 100% { filter: none; transform: none; }
    90% { filter: drop-shadow(-3px 0 #ff1a8c) drop-shadow(3px 0 #ff4d4d); transform: skewX(-1.5deg); }
    92% { filter: drop-shadow(2px 0 #00ffcc) drop-shadow(-2px 0 #ff1a8c); transform: skewX(1deg); }
    94% { filter: none; transform: none; }
    96% { filter: drop-shadow(-2px 0 #ff1a8c); transform: skewX(-0.5deg); }
    98% { filter: none; transform: none; }
  }

  /* Hero stagger: elements start invisible */
  .lb-hero-word {
    opacity: 0;
    transform: translateY(20px);
  }
  .lb-hero-word.lb-in {
    animation: lbFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .lb-divider-line {
    transform-origin: left center;
    transform: scaleX(0);
  }
  .lb-divider-line.lb-in {
    animation: lbDividerGrow 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .lb-2026 {
    display: inline-block;
    animation: lb2026Glitch 5s infinite;
  }

  /* Scroll reveal */
  .lb-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s ease-out, transform 0.55s ease-out;
  }
  .lb-reveal.lb-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .lb-reveal-delay {
    transition-delay: 90ms;
  }

  /* Image hover: glow + scale */
  .lb-fig {
    overflow: hidden;
    transition: box-shadow 0.32s ease, transform 0.32s ease;
  }
  .lb-fig:hover {
    box-shadow: 0 0 0 2px #ff1a8c, 0 0 28px rgba(255,26,140,0.3);
    transform: scale(1.015);
    z-index: 2;
  }
  /* Figcaption slide-up reveal */
  .lb-fig figcaption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2.5rem 1.25rem 1rem;
    background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%);
    font-family: var(--font-elite);
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.0);
    transform: translateY(8px);
    transition: color 0.3s ease, transform 0.3s ease;
    pointer-events: none;
  }
  .lb-fig:hover figcaption {
    color: rgba(255,255,255,0.8);
    transform: translateY(0);
  }

  /* Back button arrow nudge */
  .lb-back-arrow {
    display: inline-block;
    transition: transform 0.2s ease;
  }
  .lb-back-btn:hover .lb-back-arrow {
    transform: translateX(-4px);
  }

  /* Header fade-in */
  .lb-header {
    opacity: 0;
    animation: lbFadeUp 0.5s ease 0.05s forwards;
  }

  /* Footer fade-in */
  .lb-footer {
    opacity: 0;
  }
  .lb-footer.lb-visible {
    animation: lbFadeUp 0.6s ease forwards;
  }

  /* Reduced motion: disable everything */
  @media (prefers-reduced-motion: reduce) {
    .lb-hero-word,
    .lb-hero-word.lb-in,
    .lb-divider-line,
    .lb-divider-line.lb-in,
    .lb-2026,
    .lb-reveal,
    .lb-reveal.lb-visible,
    .lb-header,
    .lb-footer,
    .lb-footer.lb-visible {
      opacity: 1 !important;
      transform: none !important;
      animation: none !important;
      transition: none !important;
    }
    .lb-fig:hover {
      transform: none;
    }
    .lb-fig figcaption {
      color: rgba(255,255,255,0.5) !important;
      transform: none !important;
      transition: none !important;
    }
  }
`;

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
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const ref = (i: number) => (el: HTMLElement | null) => { refs.current[i] = el; };
  return ref;
}

export default function Lookbook() {
  const [, navigate] = useLocation();
  const [heroIn, setHeroIn] = useState(false);
  const reveal = useLookbookReveal();

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const delays = [0, 120, 240, 360, 480];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a", fontFamily: "var(--font-elite)" }}
    >
      <style>{LOOKBOOK_CSS}</style>

      {/* ── Header ── */}
      <header
        className="lb-header sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,26,140,0.18)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="lb-back-btn flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-elite)", transition: "color 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff1a8c")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
        >
          <span className="lb-back-arrow">←</span> ashjo.com
        </button>

        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#ff1a8c", fontFamily: "var(--font-elite)" }}>
            Ash Johansen
          </span>
          <span className="text-[10px] tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-elite)" }}>
            Summer 2026 Lookbook &mdash; Sneak Preview
          </span>
        </div>

        <div style={{ width: "80px" }} />
      </header>

      {/* ── Hero title ── */}
      <section className="px-5 pt-14 pb-8 text-center">
        <p
          className={`lb-hero-word text-[10px] tracking-[0.45em] uppercase mb-3${heroIn ? " lb-in" : ""}`}
          style={{ color: "rgba(255,26,140,0.7)", animationDelay: `${delays[0]}ms` }}
        >
          Sneak Preview
        </p>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none mb-4"
          style={{ fontFamily: "var(--font-elite)", color: "#fff", letterSpacing: "0.04em" }}
        >
          <span
            className={`block lb-hero-word${heroIn ? " lb-in" : ""}`}
            style={{ animationDelay: `${delays[1]}ms` }}
          >
            Summer
          </span>
          <span
            className={`lb-2026 lb-hero-word${heroIn ? " lb-in" : ""}`}
            style={{ color: "#ff1a8c", animationDelay: `${delays[2]}ms` }}
          >
            2026
          </span>
        </h1>

        <p
          className={`lb-hero-word text-xs tracking-[0.3em] uppercase mt-4${heroIn ? " lb-in" : ""}`}
          style={{ color: "rgba(255,255,255,0.3)", animationDelay: `${delays[3]}ms` }}
        >
          Lookbook
        </p>

        <div
          className={`lb-divider-line mx-auto mt-6${heroIn ? " lb-in" : ""}`}
          style={{
            height: "2px",
            width: "80px",
            background: "repeating-linear-gradient(90deg,#ff1a8c 0,#ff1a8c 6px,transparent 6px,transparent 12px)",
            boxShadow: "0 0 12px rgba(255,26,140,0.5)",
            animationDelay: `${delays[4]}ms`,
          }}
        />
      </section>

      {/* ── Image grid ── */}
      <main className="max-w-[1400px] mx-auto px-3 md:px-5 pb-24 space-y-3 md:space-y-4">

        {/* 1 — Full-width hero: magazine spread */}
        <figure
          ref={reveal(0) as React.Ref<HTMLElement>}
          className="lb-reveal lb-fig relative w-full"
          style={{ borderRadius: "2px" }}
        >
          <img src={IMAGES.magazineSpread} alt="Ash Johansen Summer 2026 Lookbook — Magazine Spread" className="w-full block" />
          <figcaption>The Look</figcaption>
        </figure>

        {/* 2 — Two columns: alley (2/3) + portrait (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <figure
            ref={reveal(1) as React.Ref<HTMLElement>}
            className="lb-reveal lb-fig md:col-span-2 relative"
            style={{ borderRadius: "2px" }}
          >
            <img src={IMAGES.alley} alt="Ash Johansen — Graffiti Alley Editorial" className="w-full block" />
            <figcaption>Street Essential</figcaption>
          </figure>

          <figure
            ref={reveal(2) as React.Ref<HTMLElement>}
            className="lb-reveal lb-reveal-delay lb-fig relative"
            style={{ borderRadius: "2px" }}
          >
            <img src={IMAGES.portrait} alt="Ash Johansen — Portrait" className="w-full block" />
            <figcaption>The Attitude</figcaption>
          </figure>
        </div>

        {/* 3 — Full-width: character card */}
        <figure
          ref={reveal(3) as React.Ref<HTMLElement>}
          className="lb-reveal lb-fig relative w-full"
          style={{ borderRadius: "2px" }}
        >
          <img src={IMAGES.characterCard} alt="Ash Johansen Summer 2026 — Character Reference" className="w-full block" />
          <figcaption>White Trash, But Make It Fashion</figcaption>
        </figure>

        {/* 4 — Two columns: diner + skatepark */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <figure
            ref={reveal(4) as React.Ref<HTMLElement>}
            className="lb-reveal lb-fig relative"
            style={{ borderRadius: "2px" }}
          >
            <img src={IMAGES.diner} alt="Ash Johansen — Diner / Vintage Store" className="w-full block" />
            <figcaption>Mood Board</figcaption>
          </figure>

          <figure
            ref={reveal(5) as React.Ref<HTMLElement>}
            className="lb-reveal lb-reveal-delay lb-fig relative"
            style={{ borderRadius: "2px" }}
          >
            <img src={IMAGES.skatepark} alt="Ash Johansen — Skate Park Days" className="w-full block" />
            <figcaption>Skate Park Days</figcaption>
          </figure>
        </div>

        {/* 5 — Full-width closing collage */}
        <figure
          ref={reveal(6) as React.Ref<HTMLElement>}
          className="lb-reveal lb-fig relative w-full"
          style={{ borderRadius: "2px" }}
        >
          <img src={IMAGES.collage} alt="Ash Johansen Summer 2026 — Full Lookbook Collage" className="w-full block" />
          <figcaption>Bad Decisions — Good Times</figcaption>
        </figure>

      </main>

      {/* ── Footer ── */}
      <footer
        ref={reveal(7) as React.Ref<HTMLElement>}
        className="lb-reveal text-center py-10 px-5"
        style={{ borderTop: "1px solid rgba(255,26,140,0.12)" }}
      >
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
