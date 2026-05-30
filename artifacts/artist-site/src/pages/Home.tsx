import { useEffect, useState, useRef } from "react";
import { Menu, X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { SiInstagram, SiSpotify, SiYoutube, SiApplemusic, SiYoutubemusic } from "react-icons/si";
import logoSrc from "@assets/logo.webp";
import heroBgSrc from "@assets/hero-bg.webp";
import aboutImgSrc from "@assets/about.webp";

function LiteYT({ id, title, className }: { id: string; title: string; className?: string }) {
  const [activated, setActivated] = useState(false);
  if (activated) {
    return (
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className ?? "w-full h-full"}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play ${title}`}
      className={`group relative w-full h-full block bg-black overflow-hidden ${className ?? ""}`}
      style={{
        backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <span className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-110 transition-all shadow-[0_0_30px_rgba(255,26,140,0.6)]">
          <Play size={32} className="text-black translate-x-[2px]" fill="currentColor" />
        </span>
      </span>
      <span className="sr-only">{title}</span>
    </button>
  );
}

const TRACKS = [
  { id: 1, title: "TM2YL", artist: "Ash Johansen", src: "/track-1.mp3" },
  { id: 2, title: "Amanda Hugandkiss", artist: "Ash Johansen", src: "/track-2.mp3" },
  { id: 3, title: "Future Famous", artist: "Ash Johansen", src: "/track-3.mp3" },
];

// Fallback video IDs — shown if live playlist fetch fails. Keep in sync with top 3 in playlist.
const FALLBACK_VIDEO_IDS = [
  { id: "6ZJpSVg87ic", title: 'Ash Johansen – "TM2YL"' },
  { id: "GDvx11wyT50", title: 'Ash Johansen x TMSTRY – "Lovin\' On Da Ladies"' },
  { id: "FlS3Eop3kp0", title: "Don't Die Slow" },
];

const PLAYLIST_ID = "PL6jbjn9FqoxInDO6GKY2yFljdMdSiovdf";

const HERO_QUOTE = "we should be able to look at a little porn at work.";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [musicTab, setMusicTab] = useState("spotify");
  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = currentTrackIndex !== null ? TRACKS[currentTrackIndex] : null;

  function playTrack(index: number) {
    if (currentTrackIndex === index) {
      togglePlayPause();
      return;
    }
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }

  function togglePlayPause() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function skipTrack(dir: 1 | -1) {
    if (currentTrackIndex === null) return;
    const next = (currentTrackIndex + dir + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(next);
    setCurrentTime(0);
    setIsPlaying(true);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex === null) return;
    audio.src = TRACKS[currentTrackIndex].src;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => skipTrack(1);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setIsNavOpen(false);
  };

  // Live YouTube video feed — fetched directly in the browser via a CORS proxy
  const [liveVideos, setLiveVideos] = useState<{ id: string; title: string }[]>(FALLBACK_VIDEO_IDS);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const parseXml = (xml: string) => {
      const idMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
      const titleMatches = [...xml.matchAll(/<title>([^<]+)<\/title>/g)];
      const decodeXml = (str: string) =>
        str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'");
      return idMatches.slice(0, 3).map((m, i) => ({
        id: m[1],
        title: decodeXml(titleMatches[i + 1]?.[1] ?? FALLBACK_VIDEO_IDS[i]?.title ?? `Video ${i + 1}`),
      }));
    };

    const tryProxy = async () => {
      // Primary: corsproxy.io
      try {
        const r = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(rssUrl)}`, { signal: controller.signal });
        if (r.ok) {
          const xml = await r.text();
          if (xml.includes("yt:videoId")) return parseXml(xml);
        }
      } catch {}

      // Backup: allorigins.win
      const r2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`, { signal: controller.signal });
      if (!r2.ok) throw new Error("both proxies failed");
      const json = await r2.json() as { contents: string };
      return parseXml(json.contents);
    };

    tryProxy()
      .then((videos) => { if (videos.length > 0) setLiveVideos(videos); })
      .catch(() => { /* keep hardcoded fallback */ })
      .finally(() => { clearTimeout(timer); setVideosLoading(false); });
  }, []);

  // Periodic "U OWE ME MONEY" flicker
  const [moneyFlicker, setMoneyFlicker] = useState(false);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 18000;
      timeoutId = setTimeout(() => {
        setMoneyFlicker(true);
        setTimeout(() => setMoneyFlicker(false), 280);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  // Click expletives
  const EXPLETIVES = [
    "FUCK!", "SHIT!", "DAMN!", "HELL YEAH!", "BITCH!", "ASSHOLE!",
    "GO TO HELL!", "PISS OFF!", "EAT SHIT!", "WHATEVER!", "SCREW IT!",
    "GROSS!", "OUCH!", "OW!", "STOP IT!", "WHY?!", "NO!!!",
    "U OWE ME MONEY", "PAY UP", "BRUH", "RUDE", "NASTY",
  ];
  type Pop = { id: number; text: string; x: number; y: number; rot: number };
  const [pops, setPops] = useState<Pop[]>([]);
  const popIdRef = useRef(0);
  useEffect(() => {
    // Use click (not pointerdown) so this never fires during scroll gestures on mobile
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Don't trigger when clicking real interactive elements
      if (target && target.closest("a, button, input, textarea, select, iframe, audio, video, [role='button'], label")) {
        return;
      }
      const id = ++popIdRef.current;
      const text = EXPLETIVES[Math.floor(Math.random() * EXPLETIVES.length)];
      const rot = (Math.random() * 30 - 15);
      setPops((prev) => [...prev, { id, text, x: e.clientX, y: e.clientY, rot }]);
      setTimeout(() => {
        setPops((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // ===== TRASH EFFECTS =====
  // Detect touch device (skip heavy/cursor effects on mobile) and reduced motion
  const trashEnabledRef = useRef(false);
  useEffect(() => {
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trashEnabledRef.current = hasFinePointer && !reducedMotion;
  }, []);

  // Periodic VHS tracking jitter
  const [vhsJitter, setVhsJitter] = useState(false);
  useEffect(() => {
    if (!trashEnabledRef.current && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 20000 + Math.random() * 20000;
      t = setTimeout(() => {
        setVhsJitter(true);
        setTimeout(() => setVhsJitter(false), 260);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Random censor bars over visible words
  type Bar = { id: number; x: number; y: number; w: number; h: number };
  const [censorBars, setCensorBars] = useState<Bar[]>([]);
  const barIdRef = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(".can-censor"));
      const visible = els.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0 && r.width > 0;
      });
      if (!visible.length) return;
      const el = visible[Math.floor(Math.random() * visible.length)];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const tn = n as Text;
        if (tn.nodeValue && tn.nodeValue.trim().length > 3) textNodes.push(tn);
      }
      if (!textNodes.length) return;
      const tn = textNodes[Math.floor(Math.random() * textNodes.length)];
      const text = tn.nodeValue || "";
      const words: { s: number; e: number }[] = [];
      const re = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        if (m[0].length >= 4) words.push({ s: m.index, e: m.index + m[0].length });
      }
      if (!words.length) return;
      const w = words[Math.floor(Math.random() * words.length)];
      const range = document.createRange();
      try {
        range.setStart(tn, w.s);
        range.setEnd(tn, w.e);
      } catch {
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const id = ++barIdRef.current;
      setCensorBars((prev) => [...prev, { id, x: rect.left - 2, y: rect.top - 1, w: rect.width + 4, h: rect.height + 2 }]);
      setTimeout(() => setCensorBars((prev) => prev.filter((b) => b.id !== id)), 650);
    };
    const schedule = () => {
      const delay = 15000 + Math.random() * 18000;
      t = setTimeout(() => {
        flash();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const PHOTOS = [
    { src: "/polaroid-1.webp", rotateDeg: -2, top: "4%", left: "3%", z: 5, caption: "low tar" },
    { src: "/polaroid-2.webp", rotateDeg: 3, top: "2%", left: "28%", z: 3, caption: "top 8" },
    { src: "/polaroid-3.webp", rotateDeg: 1.5, top: "6%", left: "55%", z: 6, caption: "reference" },
    { src: "/polaroid-4.webp", rotateDeg: -1, top: "1%", left: "78%", z: 4, caption: "loitering" },
    { src: "/polaroid-5.webp", rotateDeg: 2.5, top: "38%", left: "5%", z: 2, caption: "fishbowl" },
    { src: "/polaroid-6.webp", rotateDeg: -3, top: "36%", left: "35%", z: 7, caption: "liftoff" },
    { src: "/polaroid-7.webp", rotateDeg: 0.5, top: "40%", left: "62%", z: 1, caption: "technical difficulties" },
    { src: "/polaroid-8.webp", rotateDeg: -2.5, top: "35%", left: "82%", z: 5, caption: "last call" },
  ];
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => i === null ? null : (i + 1) % PHOTOS.length);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in-section").forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${vhsJitter ? "vhs-jitter" : ""}`}>
      {/* === TRASH: VHS scanlines + tracking overlay === */}
      <div className="vhs-scanlines" aria-hidden="true" />

      {/* Ambient blobs */}
      <div className="amp-blob amp-blob--pink" />
      <div className="amp-blob amp-blob--red" />

      {/* Periodic money flicker overlay (wrapper stays full-viewport; only text flickers) */}
      {moneyFlicker && (
        <div className="money-flicker" aria-hidden="true">
          <span className="money-flicker__text">U OWE ME MONEY</span>
        </div>
      )}

      {/* === TRASH: Censor bars === */}
      <div className="pointer-events-none fixed inset-0 z-[9996]" aria-hidden="true">
        {censorBars.map((b) => (
          <span
            key={b.id}
            className="censor-bar"
            style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          />
        ))}
      </div>

      {/* Click expletive pops */}
      <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
        {pops.map((p) => (
          <span
            key={p.id}
            className="expletive-pop"
            style={{
              left: p.x,
              top: p.y,
              transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            }}
          >
            {p.text}
          </span>
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-background/90 backdrop-blur-md border-b border-white/5" style={{ transform: "rotate(-0.15deg)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center"
            data-testid="link-home"
          >
            <img src={logoSrc} alt="Ash Johansen" className="h-10 w-auto" style={{ mixBlendMode: "screen" }} />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {["music", "videos", "pics", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="nav-link text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                data-testid={`link-${section}`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Mobile Nav Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsNavOpen(!isNavOpen)}
            data-testid="button-mobile-menu"
          >
            {isNavOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {isNavOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-white/5 py-6 px-6 flex flex-col gap-6">
            {["music", "videos", "pics", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="text-xl uppercase tracking-widest text-primary text-left hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-elite)" }}
              >
                {section}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            poster={heroBgSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center"
          >
            <source src="/hero.mp4" type="video/mp4" />
            <source src="/hero.webm" type="video/webm" />
          </video>
        </div>
        <div className="absolute inset-0 video-overlay" />

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <img
            src={logoSrc}
            alt="Ash Johansen"
            className="w-[min(82vw,580px)] h-auto mb-6 glitch-text"
            style={{ mixBlendMode: "screen" }}
          />
          <p
            className="hero-quote glitch-text px-5 py-2 border text-sm md:text-base tracking-[0.12em] uppercase"
            data-text={HERO_QUOTE}
            style={{
              fontFamily: "var(--font-mono)",
              color: "hsl(var(--primary))",
              borderColor: "hsl(var(--primary) / 0.5)",
              textShadow: "0 0 10px hsl(var(--primary) / 0.7)",
              borderRadius: "2px 10px 2px 10px",
              background: "rgba(0,0,0,0.75)",
              transform: "rotate(-0.4deg)",
              maxWidth: "min(90vw, 640px)",
            }}
          >
            {HERO_QUOTE}
          </p>
        </div>

        <button
          onClick={() => scrollToSection("music")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"
          data-testid="button-scroll-down"
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2" style={{ fontFamily: "var(--font-elite)" }}>Turn it up</span>
          <div className="w-[1px] h-10 bg-primary/50" />
        </button>
      </section>


      {/* Music Section */}
      <section id="music" className="py-28 px-6 max-w-7xl mx-auto relative z-10 trash-scrawl-host">
        {/* === TRASH: bathroom-stall scrawl === */}
        <span className="trash-scrawl trash-scrawl--br" aria-hidden="true">play it<br />LOUD</span>
        <div className="fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// play loud</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            MUSIC
          </h2>
          <div className="graffiti-divider" />

          {/* Track list */}
          <div className="mb-10 bg-card/40 backdrop-blur border border-white/5 overflow-hidden punk-card">
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-elite)" }}>Tracks — Preview</span>
            </div>
            {TRACKS.map((track, index) => (
              <button
                key={track.id}
                onClick={() => playTrack(index)}
                className={`cursor-finger w-full flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-b-0 transition-all duration-200 group text-left ${
                  currentTrackIndex === index ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-white/5"
                }`}
                data-testid={`button-track-${track.id}`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                  {currentTrackIndex === index && isPlaying ? (
                    <Pause size={14} className="text-primary" />
                  ) : (
                    <Play size={14} className={currentTrackIndex === index ? "text-primary" : "text-muted-foreground group-hover:text-white"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTrackIndex === index ? "text-primary" : "text-white"}`} style={{ fontFamily: "var(--font-elite)" }}>
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                {currentTrackIndex === index && (
                  <div className="flex gap-[3px] items-end h-4 flex-shrink-0">
                    {[60, 100, 75].map((h, b) => (
                      <div
                        key={b}
                        className={`w-[3px] bg-primary rounded-full ${isPlaying ? "animate-pulse" : ""}`}
                        style={{ height: `${h}%`, animationDelay: `${b * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Streaming tabs */}
          <div className="bg-card/40 backdrop-blur border border-white/5 overflow-hidden punk-card">
            <div className="flex border-b border-white/5 overflow-x-auto">
              {[
                { key: "spotify", label: "Spotify", icon: SiSpotify },
                { key: "soundcloud", label: "SoundCloud", icon: null as any },
                { key: "apple", label: "Apple Music", icon: SiApplemusic },
                { key: "ytm", label: "YouTube Music", icon: SiYoutubemusic },
              ].map((t) => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.key}
                    className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${musicTab === t.key ? "text-primary bg-white/5 border-b-2 border-primary" : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"}`}
                    style={{ fontFamily: "var(--font-elite)" }}
                    onClick={() => setMusicTab(t.key)}
                  >
                    {TabIcon && <TabIcon size={14} />}
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              {musicTab === "spotify" && (
                <iframe
                  src="https://open.spotify.com/embed/artist/0ALEPHbwPTJaqzNFMr5aMe?utm_source=generator"
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="rounded-sm"
                  title="Spotify Player"
                />
              )}
              {musicTab === "soundcloud" && (
                <iframe
                  width="100%"
                  height="360"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/1590490014&color=%23ff1a7a&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="rounded-sm"
                  title="SoundCloud Player"
                />
              )}
              {musicTab === "apple" && (
                <iframe
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  frameBorder="0"
                  height="380"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src="https://embed.music.apple.com/us/artist/ash-johansen/1817699556"
                  width="100%"
                  className="rounded-sm"
                  title="Apple Music Player"
                />
              )}
              {musicTab === "ytm" && (
                <div className="flex flex-col items-center justify-center gap-6 py-14">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <SiYoutubemusic size={36} className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs" style={{ fontFamily: "var(--font-elite)" }}>
                    Stream Ash Johansen on YouTube Music — all tracks, all the chaos.
                  </p>
                  <a
                    href="https://music.youtube.com/search?q=Ash+Johansen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
                    style={{ fontFamily: "var(--font-elite)" }}
                  >
                    <SiYoutubemusic size={16} />
                    Listen Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-28 px-6 border-y border-white/5 bg-black/40 relative z-10">
        <div className="max-w-7xl mx-auto fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// recent chaos</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            VIDEOS
          </h2>
          <div className="graffiti-divider" />

          {videosLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-video bg-card/40 border border-white/5 punk-card animate-pulse flex items-center justify-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-elite)" }}>Loading...</span>
                  </div>
                  <div className="h-5 bg-card/40 border border-white/5 punk-card animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveVideos.map((video, i) => (
                <div
                  key={video.id}
                  className="flex flex-col gap-2"
                >
                  <div className={`relative aspect-video bg-muted overflow-hidden border border-white/10 hover:border-primary/60 transition-all duration-500 shadow-2xl ${i % 2 === 0 ? "punk-card" : "punk-card-alt"}`}>
                    <div className="absolute inset-0">
                      <LiteYT id={video.id} title={video.title} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground tracking-wide truncate px-1" style={{ fontFamily: "var(--font-elite)" }}>
                    {video.title}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <a
              href="https://www.youtube.com/channel/UCxAUYa3cgDeOc2ndXIZgfPw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-colors uppercase tracking-widest text-sm"
              style={{ fontFamily: "var(--font-elite)" }}
            >
              more chaos on youtube →
            </a>
          </div>
        </div>
      </section>

      {/* Pics Section — Dive Bar Bathroom Wall */}
      <section id="pics" className="py-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// the evidence</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            PICS
          </h2>
          <div className="graffiti-divider" />
        </div>

        <div className="bathroom-wall mt-8">
          {PHOTOS.map((photo, i) => (
            <button
              key={i}
              type="button"
              className="polaroid-tile"
              style={{
                top: photo.top,
                left: photo.left,
                zIndex: photo.z,
                transform: `rotate(${photo.rotateDeg}deg)`,
              }}
              data-testid={`img-gallery-${i}`}
              onClick={() => setLightboxIndex(i)}
              aria-label={`View photo: ${photo.caption}`}
            >
              <div className="polaroid-img">
                <img
                  src={photo.src}
                  alt={`Ash Johansen — ${photo.caption}`}
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="polaroid-caption">{photo.caption}</div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <button
              className="lightbox-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + PHOTOS.length) % PHOTOS.length); }}
              aria-label="Previous photo"
            >‹</button>

            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <img
                src={PHOTOS[lightboxIndex].src}
                alt={`Ash Johansen — ${PHOTOS[lightboxIndex].caption}`}
                className="lightbox-img"
              />
              <p className="lightbox-caption">{PHOTOS[lightboxIndex].caption}</p>
            </div>

            <button
              className="lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % PHOTOS.length); }}
              aria-label="Next photo"
            >›</button>

            <button
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
            >✕</button>
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="py-28 px-6 max-w-7xl mx-auto relative z-10 trash-scrawl-host">
        {/* === TRASH: bathroom-stall scrawls === */}
        <span className="trash-scrawl trash-scrawl--tl" aria-hidden="true">for a good time<br />call 555-ASH-XOXO</span>
        <span className="trash-scrawl trash-scrawl--br" aria-hidden="true">Ash wuz here ♡</span>
        <div className="fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// who's screaming</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            ABOUT
          </h2>
          <div className="graffiti-divider" />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Polaroid-style image */}
            <div className="polaroid">
              <img src={aboutImgSrc} alt="Ash Johansen" />
              <p className="polaroid-caption">ASH &amp; JAY — 2025</p>
            </div>

            {/* Bio */}
            <div>
              <div className="bio-block">
                <p className="mb-5 can-censor">
                  <strong className="text-primary">Ash Johansen</strong> is a character and pseudonym birthed from the mind of veteran Texas artist, producer, musician, and singer,{" "}
                  <strong className="text-primary">Jason M. Ashley</strong>. After a multi-year attempt to find a versatile pop vocalist for an ambitious project, Jason gave up — and the project was lost. Then AI music happened.
                </p>
                <p className="mb-5 can-censor">
                  Taking hours and hours of incomplete demos and songs, Jason was able to turn his music and own voice into Ash Johansen.{" "}
                  <strong className="text-primary">Fierce, fun, and fucked up.</strong> The music is unmistakably Jason, but Ash adds that perfect edge: sweet and pleasing, but raw and unforgiving.
                </p>
              </div>

              <div className="mt-10 flex gap-5 flex-wrap">
                {[
                  { Icon: SiInstagram, href: "https://www.instagram.com/ashjotheahole", name: "Instagram" },
                  { Icon: SiSpotify, href: "https://open.spotify.com/artist/0ALEPHbwPTJaqzNFMr5aMe", name: "Spotify" },
                  { Icon: SiYoutube, href: "#", name: "YouTube" },
                ].map(({ Icon, href, name }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-cig w-12 h-12 rounded flex items-center justify-center border border-white/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                    style={{ borderRadius: "2px 10px 2px 10px" }}
                    aria-label={name}
                    data-testid={`link-social-${name.toLowerCase()}`}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section — slide into my DMs */}
      <section id="contact" className="py-28 px-6 bg-black/40 border-t border-white/5 relative z-10 trash-scrawl-host">
        {/* === TRASH: bathroom-stall scrawls === */}
        <span className="trash-scrawl trash-scrawl--tr" aria-hidden="true">A + ?<br />4ever</span>
        <span className="trash-scrawl trash-scrawl--bl" aria-hidden="true">i ♡ haterz</span>
        <div className="max-w-7xl mx-auto fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// scream at me</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            CONTACT
          </h2>
          <div className="graffiti-divider" />

          <div className="dm-cta">
            <p
              className="text-muted-foreground mb-8 text-lg tracking-widest uppercase"
              style={{ fontFamily: "var(--font-elite)" }}
            >
              No forms. Just slide into my DMs.
            </p>

            <div className="flex justify-center">
              <a
                href="https://www.instagram.com/ashjotheahole"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-finger inline-flex items-center gap-3 px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 neon-glow"
                style={{ fontFamily: "var(--font-marker)", fontSize: "1.2rem", borderRadius: "3px 14px 3px 14px", letterSpacing: "2px" }}
                data-testid="link-instagram-dm"
              >
                <SiInstagram size={22} />
                @ashjotheahole
              </a>
            </div>

            <p
              className="mt-8 text-xs uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: "var(--font-elite)" }}
            >
              Press · Collabs · Just saying hi
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-center border-t border-white/5 bg-background relative z-10 ${currentTrack ? "py-8 pb-28" : "py-8"}`}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-elite)" }}>
          © {new Date().getFullYear()} Ash Johansen — Sweet and pleasing. Raw and unforgiving.
        </p>
      </footer>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Sticky Bottom Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/96 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
            <div
              className="h-full bg-primary transition-none"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
            />
          </div>

          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate" style={{ fontFamily: "var(--font-elite)" }}>{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => skipTrack(-1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-prev">
                <SkipBack size={18} />
              </button>
              <button onClick={togglePlayPause} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 transition-transform neon-glow" data-testid="button-player-playpause">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={() => skipTrack(1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-next">
                <SkipForward size={18} />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 accent-[hsl(var(--primary))] cursor-pointer"
                data-testid="input-player-seek"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-8">{formatTime(duration)}</span>
            </div>

            <button onClick={() => setIsMuted((m) => !m)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-mute">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
