import { useEffect, useState, useRef } from "react";
import { Menu, X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { SiInstagram, SiYoutube, SiSpotify } from "react-icons/si";
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

const ARTIST = "Ash Johansen";

type Track = { title: string; src: string };
type Release = {
  id: string;
  title: string;
  year?: string;
  kind?: "Single" | "EP" | "Album";
  streamingDate?: string;
  cover: string;
  tracks: Track[];
};

// === RELEASES — newest first ===
// To add a release: drop its audio into public/audio/<slug>/ and its cover webp into
// public/, then PREPEND a new entry here (newest release goes at the top).
// Optional fields: `kind` shows in the card meta line; `streamingDate` ("8.19") marks a
// release as not-yet-on-streaming and renders the announcement block in the MUSIC section.
// Clear `streamingDate` once the release actually lands and the announcement disappears.
const RELEASES: Release[] = [
  {
    id: "white-truck",
    title: "WHITE TRUCK",
    kind: "Single",
    streamingDate: "8.19",
    cover: "/album-white-truck.webp",
    tracks: [
      { title: "White Truck", src: "/audio/white-truck/01-white-truck.mp3" },
    ],
  },
  {
    id: "must-go-on",
    title: "Must Go On",
    cover: "/album-must-go-on.webp",
    tracks: [
      { title: "TM2YL", src: "/audio/must-go-on/01-tm2yl.mp3" },
      { title: "Pity Party Like It's 1999", src: "/audio/must-go-on/02-pity-party.mp3" },
      { title: "Future Famous", src: "/audio/must-go-on/03-future-famous.mp3" },
      { title: "Shame", src: "/audio/must-go-on/04-shame.mp3" },
      { title: "Amanda Hugandkiss", src: "/audio/must-go-on/05-amanda-hugandkiss.mp3" },
      { title: "Cannibal", src: "/audio/must-go-on/06-cannibal.mp3" },
      { title: "RDY2DIE", src: "/audio/must-go-on/07-rdy2die.mp3" },
      { title: "Night of the Living Martyr", src: "/audio/must-go-on/08-night-of-the-living-martyr.mp3" },
      { title: "Two Faces", src: "/audio/must-go-on/09-two-faces.mp3" },
      { title: "Give Blood!", src: "/audio/must-go-on/10-give-blood.mp3" },
      { title: "Duck'n Cover", src: "/audio/must-go-on/11-duckn-cover.mp3" },
      { title: "Don't Die Slow", src: "/audio/must-go-on/12-dont-die-slow.mp3" },
    ],
  },
  {
    id: "positively-toxic",
    title: "Positively Toxic",
    cover: "/album-positively-toxic.webp",
    tracks: [
      { title: "ISLAND", src: "/audio/positively-toxic/01-island.mp3" },
      { title: "GET LOST", src: "/audio/positively-toxic/02-get-lost.mp3" },
      { title: "UBU", src: "/audio/positively-toxic/03-ubu.mp3" },
      { title: "DRUGS!", src: "/audio/positively-toxic/04-drugs.mp3" },
      { title: "BLACK LUNG", src: "/audio/positively-toxic/05-black-lung.mp3" },
      { title: "SKELETON BOYS", src: "/audio/positively-toxic/06-skeleton-boys.mp3" },
    ],
  },
  {
    id: "you-come-first",
    title: "You Come First",
    cover: "/album-you-come-first.webp",
    tracks: [
      { title: "Run On Me", src: "/audio/you-come-first/01-run-on-me.mp3" },
      { title: "Bad Trip", src: "/audio/you-come-first/02-bad-trip-yuh.mp3" },
      { title: "Seeing Shadows", src: "/audio/you-come-first/03-seeing-shadows.mp3" },
    ],
  },
  {
    id: "90s-kid",
    title: "90's Kid",
    cover: "/album-90s-kid.webp",
    tracks: [
      { title: "Yer Highness", src: "/audio/90s-kid/01-yer-highness.mp3" },
      { title: "Act of God", src: "/audio/90s-kid/02-dis-it.mp3" },
      { title: "I Lied About Heaven", src: "/audio/90s-kid/03-i-lied-about-heaven.mp3" },
      { title: "Misery Feed", src: "/audio/90s-kid/04-goat.mp3" },
      { title: "Bottoms Up", src: "/audio/90s-kid/05-bottoms-up.mp3" },
      { title: "Dead Inside", src: "/audio/90s-kid/06-dead-inside.mp3" },
    ],
  },
  {
    id: "bad-luck-chuck",
    title: "Bad Luck Chuck",
    cover: "/album-bad-luck-chuck.webp",
    tracks: [
      { title: "Wrench Thrower", src: "/audio/bad-luck-chuck/01-the-wrench-thrower.mp3" },
      { title: "The Pessimist", src: "/audio/bad-luck-chuck/02-the-pessimist.mp3" },
      { title: "Commit", src: "/audio/bad-luck-chuck/03-commit.mp3" },
      { title: "One Bad Day", src: "/audio/bad-luck-chuck/04-bad-luck-chuck.mp3" },
      { title: "Hate You, Mean It!", src: "/audio/bad-luck-chuck/05-hate-you-mean-it.mp3" },
      { title: "Strong Female Lead", src: "/audio/bad-luck-chuck/06-strong-female-lead.mp3" },
      { title: "Open Hand / Closed Fist", src: "/audio/bad-luck-chuck/07-open-hand-closed-fist.mp3" },
      { title: "The More You Know Me", src: "/audio/bad-luck-chuck/08-the-more-you-know-me.mp3" },
      { title: "Bad News (For You)", src: "/audio/bad-luck-chuck/09-wait-an-blanc.mp3" },
    ],
  },
];

// Latest music video — used by the hero sticker, the MUSIC-section CTA, and the fallback list.
const LATEST_VIDEO_ID = "7gbCnCOREBk";
const LATEST_VIDEO_URL = `https://www.youtube.com/watch?v=${LATEST_VIDEO_ID}`;
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UCxAUYa3cgDeOc2ndXIZgfPw";

// The release the MUSIC-section announcement points at (the newest one).
const NEW_RELEASE_INDEX = 0;

// Fallback video IDs — shown if live playlist fetch fails. Keep in sync with top 3 in playlist.
const FALLBACK_VIDEO_IDS = [
  { id: LATEST_VIDEO_ID, title: 'Ash Johansen – "White Truck" (Official Music Video)' },
  { id: "F9Ucr687l3s", title: 'Ash Johansen – "RDY2DIE" (Official Music Video)' },
  { id: "6ZJpSVg87ic", title: 'Ash Johansen – "TM2YL" (Official Music Video)' },
  { id: "GDvx11wyT50", title: 'Ash Johansen x TMSTRY – "Lovin\' On Da Ladies" (Official Music Video)' },
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
  const [pastHero, setPastHero] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.15) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedReleaseIndex, setSelectedReleaseIndex] = useState(0);
  const [playingReleaseIndex, setPlayingReleaseIndex] = useState<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});

  const selectedRelease = RELEASES[selectedReleaseIndex];
  const trackCount = selectedRelease.tracks.length;
  const playingRelease = playingReleaseIndex !== null ? RELEASES[playingReleaseIndex] : null;
  const currentTrack =
    playingRelease && currentTrackIndex !== null ? playingRelease.tracks[currentTrackIndex] : null;

  function playTrack(releaseIndex: number, trackIndex: number) {
    if (playingReleaseIndex === releaseIndex && currentTrackIndex === trackIndex) {
      togglePlayPause();
      return;
    }
    setPlayingReleaseIndex(releaseIndex);
    setCurrentTrackIndex(trackIndex);
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
    if (playingReleaseIndex === null || currentTrackIndex === null) return;
    const tracks = RELEASES[playingReleaseIndex].tracks;
    const next = (currentTrackIndex + dir + tracks.length) % tracks.length;
    setCurrentTrackIndex(next);
    setCurrentTime(0);
    setIsPlaying(true);
  }

  const skipTrackRef = useRef(skipTrack);
  skipTrackRef.current = skipTrack;

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playingReleaseIndex === null || currentTrackIndex === null) return;
    audio.src = RELEASES[playingReleaseIndex].tracks[currentTrackIndex].src;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [playingReleaseIndex, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => skipTrackRef.current(1);
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

  useEffect(() => {
    const controllers: (() => void)[] = [];
    for (const release of RELEASES) {
      for (const track of release.tracks) {
        const a = new Audio();
        a.preload = "metadata";
        const onMeta = () => {
          setTrackDurations((prev) => ({ ...prev, [track.src]: a.duration }));
        };
        a.addEventListener("loadedmetadata", onMeta);
        a.src = track.src;
        controllers.push(() => {
          a.removeEventListener("loadedmetadata", onMeta);
          a.src = "";
        });
      }
    }
    return () => controllers.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const [igPhotos, setIgPhotos] = useState<{ src: string; rotateDeg: number; top: string; left: string; z: number; caption: string }[]>([]);

  const PHOTOS = [
    // Row 1 (~3–8%)
    { src: "/polaroid-1.webp",  rotateDeg: -2,   top: "3%",  left: "2%",  z: 5,  caption: "low tar" },
    { src: "/polaroid-2.webp",  rotateDeg: 3,    top: "2%",  left: "26%", z: 3,  caption: "top 8" },
    { src: "/polaroid-3.webp",  rotateDeg: 1.5,  top: "7%",  left: "52%", z: 6,  caption: "reference" },
    { src: "/polaroid-4.webp",  rotateDeg: -1,   top: "3%",  left: "76%", z: 4,  caption: "loitering" },
    // Row 1b (~13–18%)
    { src: "/polaroid-9.webp",  rotateDeg: 5,    top: "15%", left: "11%", z: 14, caption: "ass vibes" },
    { src: "/polaroid-10.webp", rotateDeg: -3.5, top: "13%", left: "36%", z: 11, caption: "retail therapy" },
    { src: "/polaroid-11.webp", rotateDeg: 2,    top: "17%", left: "61%", z: 16, caption: "outnumbered" },
    { src: "/polaroid-12.webp", rotateDeg: -5,   top: "12%", left: "80%", z: 12, caption: "smokes in space" },
    // Row 2 (~34–42%)
    { src: "/polaroid-5.webp",  rotateDeg: 2.5,  top: "35%", left: "4%",  z: 2,  caption: "fishbowl" },
    { src: "/polaroid-6.webp",  rotateDeg: -3,   top: "38%", left: "29%", z: 7,  caption: "liftoff" },
    { src: "/polaroid-7.webp",  rotateDeg: 0.5,  top: "41%", left: "56%", z: 1,  caption: "technical difficulties" },
    { src: "/polaroid-8.webp",  rotateDeg: -2.5, top: "34%", left: "78%", z: 5,  caption: "last call" },
    // Row 3 (~57–64%)
    { src: "/polaroid-13.webp", rotateDeg: 4,    top: "59%", left: "2%",  z: 10, caption: "tuesday" },
    { src: "/polaroid-14.webp", rotateDeg: -2,   top: "57%", left: "27%", z: 18, caption: "divebar selfie" },
    { src: "/polaroid-15.webp", rotateDeg: -4,   top: "63%", left: "54%", z: 15, caption: "normal face" },
    { src: "/polaroid-16.webp", rotateDeg: 3.5,  top: "58%", left: "77%", z: 13, caption: "one eye open" },
  ];

  const IG_SLOTS = [
    { top: "72%", left: "3%",  rotateDeg: -3   },
    { top: "69%", left: "26%", rotateDeg:  2   },
    { top: "75%", left: "51%", rotateDeg: -4.5 },
    { top: "70%", left: "74%", rotateDeg:  1   },
    { top: "81%", left: "11%", rotateDeg:  3.5 },
    { top: "80%", left: "38%", rotateDeg: -2   },
    { top: "83%", left: "62%", rotateDeg:  4   },
    { top: "78%", left: "80%", rotateDeg: -1.5 },
  ];

  const allPhotos = [...PHOTOS, ...igPhotos];

  useEffect(() => {
    fetch("/api/instagram-feed")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { posts: Array<{ imageUrl: string; caption: string }> }) => {
        const photos = data.posts.slice(0, 8).map((post, i) => ({
          src: post.imageUrl,
          caption: (post.caption ?? "").slice(0, 60),
          ...IG_SLOTS[i % IG_SLOTS.length],
          z: 20 + i,
        }));
        setIgPhotos(photos);
      })
      .catch(() => { /* silent fail — static photos still show */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const total = allPhotos.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => i === null ? null : (i + 1) % total);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => i === null ? null : (i - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, igPhotos.length]);

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
      <nav className="fixed top-0 w-full z-40 backdrop-blur-md border-b border-primary/20" style={{ transform: "rotate(-0.15deg)", background: "rgba(12, 2, 6, 0.93)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center"
            data-testid="link-home"
          >
            <img src={logoSrc} alt="Ash Johansen" className={`w-auto transition-all duration-300 ${pastHero ? "h-14" : "h-10"}`} style={{ mixBlendMode: "screen" }} />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {["music", "videos", "pics", "about", "frenz", "contact"].map((section) => (
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
            {["music", "videos", "pics", "about", "frenz", "contact"].map((section) => (
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
            ref={heroVideoRef}
            poster={heroBgSrc}
            autoPlay
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


        <button
          onClick={() => scrollToSection("music")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"
          data-testid="button-scroll-down"
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2" style={{ fontFamily: "var(--font-elite)" }}>Turn it up</span>
          <div className="w-[1px] h-10 bg-primary/50" />
        </button>

        {/* NEW MUSIC VIDEO thumbnail card */}
        <a
          href={LATEST_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={'Watch the "White Truck" music video'}
          className="absolute z-20 mv-sticker group"
          data-testid="link-hero-music-video"
        >
          {/* thumbnail image */}
          <div className="relative overflow-hidden" style={{ width: "148px", boxShadow: "0 6px 24px rgba(0,0,0,0.8), 0 0 0 3px #ff1a8c" }}>
            <img
              src={`https://img.youtube.com/vi/${LATEST_VIDEO_ID}/mqdefault.jpg`}
              alt={'"White Truck" music video'}
              width={148}
              height={83}
              style={{ display: "block", width: "100%", height: "83px", objectFit: "cover" }}
            />
            {/* play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#ff1a8c", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(255,26,140,0.7)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><polygon points="3,1 11,6 3,11" /></svg>
              </div>
            </div>
          </div>
          {/* label below */}
          <div style={{ background: "#ff1a8c", padding: "3px 8px", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-elite)", fontSize: "9px", letterSpacing: "0.2em", color: "#fff", textTransform: "uppercase", display: "block" }}>White Truck</span>
            <span style={{ fontFamily: "var(--font-elite)", fontSize: "7px", letterSpacing: "0.16em", color: "#fff", opacity: 0.85, textTransform: "uppercase", display: "block" }}>Official Video</span>
          </div>
        </a>
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

          {/* === NEW SINGLE / DISTRIBUTOR ANNOUNCEMENT ===
              Dated copy. Driven by `streamingDate` on the newest release — clear that
              field once WHITE TRUCK is actually live and this whole block disappears. */}
          {RELEASES[NEW_RELEASE_INDEX].streamingDate && (
            <div
              className="mb-10 bg-card/40 backdrop-blur border border-primary/30 punk-card-alt p-6 md:p-8"
              data-testid="block-release-announcement"
            >
              <span
                className="inline-block bg-primary text-black text-[10px] px-2 py-1 uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-elite)" }}
              >
                Out {RELEASES[NEW_RELEASE_INDEX].streamingDate}
              </span>

              <h3
                className="mt-3 text-2xl md:text-3xl text-primary neon-text-glow leading-tight"
                style={{ fontFamily: "var(--font-elite)" }}
              >
                New single &mdash; &ldquo;{RELEASES[NEW_RELEASE_INDEX].title}&rdquo;
              </h3>

              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl" style={{ fontFamily: "var(--font-elite)" }}>
                Good news, creeps: we found a new distributor. Ash is headed back to the streaming services soon.
              </p>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl" style={{ fontFamily: "var(--font-elite)" }}>
                &ldquo;White Truck&rdquo; hits streaming <span className="text-primary">{RELEASES[NEW_RELEASE_INDEX].streamingDate}</span>. Until then there are exactly two places to hear it &mdash; right here, and the music video.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelectedReleaseIndex(NEW_RELEASE_INDEX);
                    playTrack(NEW_RELEASE_INDEX, 0);
                  }}
                  className="cursor-finger inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black text-sm font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
                  style={{ fontFamily: "var(--font-elite)" }}
                  data-testid="button-announcement-listen"
                >
                  <Play size={16} /> Listen here now
                </button>

                <a
                  href={LATEST_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-finger inline-flex items-center justify-center px-6 py-3 border border-primary/40 text-primary text-sm uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-colors"
                  style={{ fontFamily: "var(--font-elite)" }}
                  data-testid="link-announcement-video"
                >
                  Watch the video &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Release browser — shown when there is more than one album */}
          {RELEASES.length > 1 && (
            <div className="mb-8 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {RELEASES.map((release, rIndex) => {
                const active = rIndex === selectedReleaseIndex;
                return (
                  <button
                    key={release.id}
                    onClick={() => setSelectedReleaseIndex(rIndex)}
                    className={`cursor-finger group flex-shrink-0 w-32 sm:w-40 snap-start text-left transition-all duration-200 ${active ? "" : "opacity-60 hover:opacity-100"}`}
                    data-testid={`button-release-${release.id}`}
                  >
                    <div className={`relative aspect-square overflow-hidden border ${active ? "border-primary neon-glow" : "border-white/10 group-hover:border-primary/50"} transition-colors`}>
                      <img src={release.cover} alt={`${release.title} cover`} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <p className={`mt-2 text-xs uppercase tracking-widest truncate ${active ? "text-primary" : "text-white"}`} style={{ fontFamily: "var(--font-elite)" }}>{release.title}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected release — cover + tracklist */}
          <div className="bg-card/40 backdrop-blur border border-white/5 overflow-hidden punk-card">
            <div className="flex flex-col md:flex-row">
              {/* Cover + album meta */}
              <div className="md:w-72 lg:w-80 flex-shrink-0 p-5 md:border-r border-b md:border-b-0 border-white/5">
                <div className="relative aspect-square overflow-hidden border border-white/10">
                  <img src={selectedRelease.cover} alt={`${selectedRelease.title} cover`} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-4 text-2xl text-primary neon-text-glow leading-tight" style={{ fontFamily: "var(--font-elite)" }}>
                  {selectedRelease.title}
                </h3>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1" style={{ fontFamily: "var(--font-elite)" }}>
                  {ARTIST}
                  {selectedRelease.year ? ` — ${selectedRelease.year}` : ""}
                  {selectedRelease.kind ? ` · ${selectedRelease.kind}` : ""}
                  {` · ${trackCount} ${trackCount === 1 ? "track" : "tracks"}`}
                </p>
                {selectedRelease.streamingDate && (
                  <span
                    className="inline-block mt-2 bg-primary text-black text-[10px] px-2 py-1 uppercase tracking-[0.18em]"
                    style={{ fontFamily: "var(--font-elite)" }}
                  >
                    On streaming {selectedRelease.streamingDate}
                  </span>
                )}
                <button
                  onClick={() => playTrack(selectedReleaseIndex, 0)}
                  className="cursor-finger mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-black text-sm font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
                  style={{ fontFamily: "var(--font-elite)" }}
                  data-testid="button-play-album"
                >
                  <Play size={16} /> {trackCount === 1 ? "Play single" : "Play album"}
                </button>
              </div>

              {/* Tracklist */}
              <div className="flex-1 min-w-0">
                {selectedRelease.tracks.map((track, index) => {
                  const isCurrent = playingReleaseIndex === selectedReleaseIndex && currentTrackIndex === index;
                  return (
                    <button
                      key={track.src}
                      onClick={() => playTrack(selectedReleaseIndex, index)}
                      className={`cursor-finger w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 transition-all duration-200 group text-left ${
                        isCurrent ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-white/5"
                      }`}
                      data-testid={`button-track-${index}`}
                    >
                      <span className="w-6 text-xs tabular-nums text-muted-foreground flex-shrink-0 text-center group-hover:hidden" style={{ display: isCurrent ? "none" : undefined }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={`w-6 h-6 items-center justify-center flex-shrink-0 ${isCurrent ? "flex" : "hidden group-hover:flex"}`}>
                        {isCurrent && isPlaying ? (
                          <Pause size={14} className="text-primary" />
                        ) : (
                          <Play size={14} className={isCurrent ? "text-primary" : "text-white"} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-white"}`} style={{ fontFamily: "var(--font-elite)" }}>
                          {track.title}
                        </p>
                      </div>
                      {isCurrent ? (
                        <div className="flex gap-[3px] items-end h-4 flex-shrink-0">
                          {[60, 100, 75].map((h, b) => (
                            <div
                              key={b}
                              className={`w-[3px] bg-primary rounded-full ${isPlaying ? "animate-pulse" : ""}`}
                              style={{ height: `${h}%`, animationDelay: `${b * 0.15}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs tabular-nums text-muted-foreground flex-shrink-0 w-9 text-right">
                          {trackDurations[track.src] != null ? formatTime(trackDurations[track.src]) : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2 min-w-0 w-full overflow-hidden">
                  <div className="aspect-video bg-card/40 border border-white/5 punk-card animate-pulse flex items-center justify-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-elite)" }}>Loading...</span>
                  </div>
                  <div className="h-5 bg-card/40 border border-white/5 punk-card animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveVideos.map((video, i) => (
                <div
                  key={video.id}
                  className="flex flex-col gap-2 min-w-0 w-full overflow-hidden"
                >
                  <div className={`relative w-full overflow-hidden border border-white/10 hover:border-primary/60 transition-all duration-500 shadow-2xl ${i % 2 === 0 ? "punk-card" : "punk-card-alt"}`} style={{ aspectRatio: "16/9" }}>
                    <div className="absolute inset-0">
                      <LiteYT id={video.id} title={video.title} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground tracking-wide truncate px-1 min-w-0" style={{ fontFamily: "var(--font-elite)" }}>
                    {video.title}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <a
              href={YOUTUBE_CHANNEL_URL}
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
          {allPhotos.map((photo, i) => (
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
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + allPhotos.length) % allPhotos.length); }}
              aria-label="Previous photo"
            >‹</button>

            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <img
                src={allPhotos[lightboxIndex].src}
                alt={`Ash Johansen — ${allPhotos[lightboxIndex].caption}`}
                className="lightbox-img"
              />
              <p className="lightbox-caption">{allPhotos[lightboxIndex].caption}</p>
            </div>

            <button
              className="lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % allPhotos.length); }}
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
                  { Icon: SiYoutube, href: YOUTUBE_CHANNEL_URL, name: "YouTube" },
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

      {/* FRENZ */}
      <section id="frenz" className="py-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto fade-in-section opacity-0 translate-y-8 transition-all duration-700">
          <span className="section-tag">// people i actually like</span>
          <h2 className="text-4xl md:text-6xl text-primary neon-text-glow mt-2 mb-3 leading-tight">
            FRENZ
          </h2>
          <div className="graffiti-divider" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
            {[
              { name: "Aidan Yagu",             url: "https://aidanyagu.com/",           yt: "https://www.youtube.com/@AidanYagu",            tagline: "Beats and rap and songs about some deep shit I don't even get sometimes but fuck its cool.", image: "/frenz-aidan.webp" },
              { name: "Professor Jacket Music", url: "https://freshfridayfestival.com/", yt: "https://www.youtube.com/@Professorjacketmusic", tagline: "Catchy, funny, silly, and all the other dope shit I love to hear when I'm hhhhiiiiiii",     image: "/frenz-professor.webp" },
              { name: "Saera Nova",             url: "https://saeranova.com/",           yt: "https://www.youtube.com/@saeranovastudios",     tagline: "Lynch-like weird shorts and trippy music videos and catchy fuckin songs and stuf.",         image: "/frenz-saera.webp" },
              { name: "TMSTRY",                 url: "https://tmstry.com/",              yt: "https://www.youtube.com/@TMSTRY-music",         tagline: "Electronic, deep bass shit that makes my head buzz and my eyes wobble, shit is cool af.",    image: "/frenz-tmstry.webp" },
            ].map(({ name, url, yt, tagline, image }) => (
              <div
                key={name}
                className="group punk-card relative flex flex-col border border-white/10 overflow-hidden hover:border-primary/60 transition-all duration-300"
                style={{ aspectRatio: "9/16" }}
              >
                {/* Full-bleed background photo */}
                <div
                  className="absolute inset-0 bg-cover bg-top"
                  style={{ backgroundImage: `url(${image})` }}
                />

                {/* Gradient: transparent top → semi-dark bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent from-[40%] via-[52%] to-black/80 to-[75%]" />

                {/* Text + links anchored to bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-4">
                  <p
                    className="text-xl text-white group-hover:text-primary transition-colors leading-tight drop-shadow-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {name}
                  </p>
                  <p
                    className="mt-2 text-[10px] text-white/55 italic leading-snug"
                    style={{ fontFamily: "var(--font-elite)" }}
                  >
                    {tagline}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] uppercase tracking-widest px-2 py-1 border border-white/30 text-white/70 hover:border-primary hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--font-elite)" }}
                    >
                      Website
                    </a>
                    <a
                      href={yt}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] uppercase tracking-widest px-2 py-1 border border-white/30 text-white/70 hover:border-primary hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--font-elite)" }}
                    >
                      YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
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
      <footer className={`text-center border-t border-white/5 bg-background relative z-10 ${currentTrack ? "py-8 pb-36" : "py-8"}`}>
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

          <div className="max-w-7xl mx-auto flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {playingRelease && (
                <img
                  src={playingRelease.cover}
                  alt={`${playingRelease.title} cover`}
                  className="w-11 h-11 flex-shrink-0 object-cover border border-white/10"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate" style={{ fontFamily: "var(--font-elite)" }}>{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate">{playingRelease ? `${ARTIST} — ${playingRelease.title}` : ARTIST}</p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button onClick={() => skipTrack(-1)} aria-label="Previous track" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-prev">
                  <SkipBack size={18} />
                </button>
                <button onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 transition-transform neon-glow" data-testid="button-player-playpause">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={() => skipTrack(1)} aria-label="Next track" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-next">
                  <SkipForward size={18} />
                </button>
                <button onClick={() => setIsMuted((m) => !m)} aria-label={isMuted ? "Unmute" : "Mute"} className="hidden sm:flex w-9 h-9 items-center justify-center text-muted-foreground hover:text-white transition-colors" data-testid="button-player-mute">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 accent-[hsl(var(--primary))] cursor-pointer"
                data-testid="input-player-seek"
                aria-label="Seek"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-9">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
