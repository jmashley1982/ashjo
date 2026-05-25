import { useEffect, useState, useRef } from "react";
import { Menu, X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { SiInstagram, SiSpotify, SiYoutube, SiApplemusic, SiYoutubemusic } from "react-icons/si";
import logoSrc from "@assets/signature_2_white-08_1779741152285.png";
import heroBgSrc from "@assets/freepik_ashmullet-stands-in-an-empty-parking-lot-it-is-night-_1779741287440.jpeg";
import aboutImgSrc from "@assets/ash-and-jay-6mI0AaW9z1GYBoHs6ZTZUg_1779741287440.jpeg";

const TRACKS = [
  { id: 1, title: "TM2YL", artist: "Ash Johansen", src: "/Ash_Johansen_TM2YL_1779743569994.mp3" },
  { id: 2, title: "Amanda Hugandkiss", artist: "Ash Johansen", src: "/Ash_Johansen_Amanda_Hugandkiss_1779743569994.mp3" },
  { id: 3, title: "Future Famous", artist: "Ash Johansen", src: "/Ash_Johansen_Future_Famous_1779743569993.mp3" },
];

// Fallback video IDs shown while live feed loads or if API is unavailable
const FALLBACK_VIDEO_IDS = ["6ZJpSVg87ic", "mqWEPS37iyY", "FlS3Eop3kp0", "Mpo-ghb5Ggs", "dQw4w9WgXcQ", "Z8Z7n1r2e5s"];

const HERO_QUOTE = "I can't know how to hear any more about tables!";

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

  // Intersection Observer for fade-in animations
  // Live YouTube video feed
  const [liveVideos, setLiveVideos] = useState<{ id: string; title: string }[]>(
    FALLBACK_VIDEO_IDS.map((id, i) => ({ id, title: `Video ${i + 1}` }))
  );
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube-feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.videos?.length) setLiveVideos(data.videos);
      })
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, []);

  const [heroParallax, setHeroParallax] = useState(0);
  useEffect(() => {
    const onScroll = () => setHeroParallax(window.scrollY * 0.35);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="amp-blob amp-blob--pink" />
      <div className="amp-blob amp-blob--red" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/5" style={{ transform: "rotate(-0.15deg)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center"
            data-testid="link-home"
          >
            <img src={logoSrc} alt="Ash Johansen" className="h-10 w-auto" style={{ mixBlendMode: "screen" }} />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
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
          <img
            src={heroBgSrc}
            alt="Ash Johansen"
            className="w-full object-cover object-center grayscale"
            style={{
              height: "130%",
              transform: `translateY(${heroParallax}px)`,
              willChange: "transform",
            }}
          />
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
      <section id="music" className="py-28 px-6 max-w-7xl mx-auto relative z-10">
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
                className={`w-full flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-b-0 transition-all duration-200 group text-left ${
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-video bg-card/40 border border-white/5 punk-card animate-pulse flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-elite)" }}>Loading...</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveVideos.map((video, i) => (
                <div
                  key={video.id}
                  className={`group relative aspect-video bg-muted overflow-hidden border border-white/10 hover:border-primary/60 transition-all duration-500 shadow-2xl ${i % 2 === 0 ? "punk-card" : "punk-card-alt"}`}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  />
                </div>
              ))}
            </div>
          )}
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
          {[
            { src: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[-2deg]", top: "4%", left: "3%", z: 5 },
            { src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[3deg]", top: "2%", left: "28%", z: 3 },
            { src: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[1.5deg]", top: "6%", left: "55%", z: 6 },
            { src: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[-1deg]", top: "1%", left: "78%", z: 4 },
            { src: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[2.5deg]", top: "38%", left: "5%", z: 2 },
            { src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[-3deg]", top: "36%", left: "35%", z: 7 },
            { src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[0.5deg]", top: "40%", left: "62%", z: 1 },
            { src: "https://images.unsplash.com/photo-1493225255440-1b62b490e1d5?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[-2.5deg]", top: "35%", left: "82%", z: 5 },
            { src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80", rotate: "rotate-[1deg]", top: "70%", left: "15%", z: 3 },
          ].map((photo, i) => (
            <div
              key={i}
              className={`polaroid-tile ${photo.rotate}`}
              style={{ top: photo.top, left: photo.left, zIndex: photo.z }}
              data-testid={`img-gallery-${i}`}
            >
              <div className="polaroid-img">
                <img
                  src={photo.src}
                  alt={`Ash Johansen photo ${i + 1}`}
                  loading="lazy"
                />
              </div>
              <div className="polaroid-caption">ASH {String.fromCharCode(65 + i)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-28 px-6 max-w-7xl mx-auto relative z-10">
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
                <p className="mb-5">
                  <strong className="text-primary">Ash Johansen</strong> is a character and pseudonym birthed from the mind of veteran Texas artist, producer, musician, and singer,{" "}
                  <strong className="text-primary">Jason M. Ashley</strong>. After a multi-year attempt to find a versatile pop vocalist for an ambitious project, Jason gave up — and the project was lost. Then AI music happened.
                </p>
                <p className="mb-5">
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
                    className="w-12 h-12 rounded flex items-center justify-center border border-white/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
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
      <section id="contact" className="py-28 px-6 bg-black/40 border-t border-white/5 relative z-10">
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
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 neon-glow"
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
