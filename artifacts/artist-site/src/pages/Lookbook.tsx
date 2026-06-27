import { useLocation } from "wouter";

const IMAGES = {
  magazineSpread: "/lookbook/05-magazine-spread.png",
  alley: "/lookbook/02-alley.png",
  portrait: "/lookbook/04-portrait.png",
  characterCard: "/lookbook/03-character-card.png",
  diner: "/lookbook/07-diner.png",
  skatepark: "/lookbook/01-skatepark.png",
  collage: "/lookbook/06-collage.png",
};

export default function Lookbook() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a", fontFamily: "var(--font-elite)" }}
    >
      {/* ── Header bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,26,140,0.18)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase transition-colors"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-elite)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#ff1a8c")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")
          }
        >
          ← ashjo.com
        </button>

        <div className="flex flex-col items-center gap-0.5 text-center">
          <span
            className="text-xs tracking-[0.35em] uppercase"
            style={{ color: "#ff1a8c", fontFamily: "var(--font-elite)" }}
          >
            Ash Johansen
          </span>
          <span
            className="text-[10px] tracking-[0.28em] uppercase"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-elite)" }}
          >
            Summer 2026 Lookbook &mdash; Sneak Preview
          </span>
        </div>

        <div style={{ width: "80px" }} />
      </header>

      {/* ── Hero title ── */}
      <section className="px-5 pt-14 pb-8 text-center">
        <p
          className="text-[10px] tracking-[0.45em] uppercase mb-3"
          style={{ color: "rgba(255,26,140,0.7)" }}
        >
          Sneak Preview
        </p>
        <h1
          className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "#fff",
            letterSpacing: "0.04em",
          }}
        >
          Summer<br />
          <span style={{ color: "#ff1a8c" }}>2026</span>
        </h1>
        <p
          className="text-xs tracking-[0.3em] uppercase mt-4"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Lookbook
        </p>
        <div
          className="mx-auto mt-6"
          style={{
            height: "2px",
            width: "80px",
            background:
              "repeating-linear-gradient(90deg,#ff1a8c 0,#ff1a8c 6px,transparent 6px,transparent 12px)",
            boxShadow: "0 0 12px rgba(255,26,140,0.5)",
          }}
        />
      </section>

      {/* ── Image grid ── */}
      <main className="max-w-[1400px] mx-auto px-3 md:px-5 pb-24 space-y-3 md:space-y-4">

        {/* 1 — Full-width hero: magazine spread */}
        <figure className="relative w-full overflow-hidden" style={{ borderRadius: "2px" }}>
          <img
            src={IMAGES.magazineSpread}
            alt="Ash Johansen Summer 2026 Lookbook — Magazine Spread"
            className="w-full block object-cover"
            style={{ aspectRatio: "16/9", objectPosition: "center top" }}
          />
          <figcaption
            className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
          >
            The Look
          </figcaption>
        </figure>

        {/* 2 — Two columns: alley (2/3) + portrait (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <figure
            className="md:col-span-2 relative overflow-hidden"
            style={{ borderRadius: "2px" }}
          >
            <img
              src={IMAGES.alley}
              alt="Ash Johansen — Graffiti Alley Editorial"
              className="w-full block object-cover"
              style={{ aspectRatio: "4/3", objectPosition: "center" }}
            />
            <figcaption
              className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
            >
              Street Essential
            </figcaption>
          </figure>

          <figure
            className="relative overflow-hidden"
            style={{ borderRadius: "2px" }}
          >
            <img
              src={IMAGES.portrait}
              alt="Ash Johansen — Portrait"
              className="w-full block object-cover"
              style={{ aspectRatio: "4/3", objectPosition: "center top" }}
            />
            <figcaption
              className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
            >
              The Attitude
            </figcaption>
          </figure>
        </div>

        {/* 3 — Full-width: character card / reference sheet */}
        <figure className="relative w-full overflow-hidden" style={{ borderRadius: "2px" }}>
          <img
            src={IMAGES.characterCard}
            alt="Ash Johansen Summer 2026 — Character Reference"
            className="w-full block object-cover"
            style={{ aspectRatio: "16/7", objectPosition: "center 15%" }}
          />
          <figcaption
            className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
          >
            White Trash, But Make It Fashion
          </figcaption>
        </figure>

        {/* 4 — Two columns: diner (1/2) + skatepark (1/2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <figure className="relative overflow-hidden" style={{ borderRadius: "2px" }}>
            <img
              src={IMAGES.diner}
              alt="Ash Johansen — Diner / Vintage Store"
              className="w-full block object-cover"
              style={{ aspectRatio: "4/3", objectPosition: "center" }}
            />
            <figcaption
              className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
            >
              Mood Board
            </figcaption>
          </figure>

          <figure className="relative overflow-hidden" style={{ borderRadius: "2px" }}>
            <img
              src={IMAGES.skatepark}
              alt="Ash Johansen — Skate Park Days"
              className="w-full block object-cover"
              style={{ aspectRatio: "4/3", objectPosition: "center" }}
            />
            <figcaption
              className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
            >
              Skate Park Days
            </figcaption>
          </figure>
        </div>

        {/* 5 — Full-width closing collage */}
        <figure className="relative w-full overflow-hidden" style={{ borderRadius: "2px" }}>
          <img
            src={IMAGES.collage}
            alt="Ash Johansen Summer 2026 — Full Lookbook Collage"
            className="w-full block object-cover"
            style={{ aspectRatio: "16/9", objectPosition: "center" }}
          />
          <figcaption
            className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-elite)" }}
          >
            Bad Decisions — Good Times
          </figcaption>
        </figure>

      </main>

      {/* ── Footer ── */}
      <footer
        className="text-center py-10 px-5"
        style={{ borderTop: "1px solid rgba(255,26,140,0.12)" }}
      >
        <p
          className="text-[10px] tracking-[0.35em] uppercase"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-elite)" }}
        >
          &copy; Ash Johansen 2026 &mdash; all rights reserved
        </p>
        <p
          className="text-[10px] tracking-[0.25em] uppercase mt-2 italic"
          style={{ color: "rgba(255,26,140,0.4)", fontFamily: "var(--font-elite)" }}
        >
          &ldquo;I do what I want, when I want.&rdquo;
        </p>
      </footer>
    </div>
  );
}
