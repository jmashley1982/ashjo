import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Menu, X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { SiInstagram, SiSpotify, SiYoutube, SiX } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import logoSrc from "@assets/signature_2_white-08_1779741152285.png";
import heroBgSrc from "@assets/freepik_ashmullet-stands-in-an-empty-parking-lot-it-is-night-_1779741287440.jpeg";
import aboutImgSrc from "@assets/ash-and-jay-6mI0AaW9z1GYBoHs6ZTZUg_1779741287440.jpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// Replace src values with your actual audio file URLs
const TRACKS = [
  { id: 1, title: "Replace with Track Title", artist: "Ash Johansen", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Replace with Track Title", artist: "Ash Johansen", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Replace with Track Title", artist: "Ash Johansen", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Replace with Track Title", artist: "Ash Johansen", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Replace with Track Title", artist: "Ash Johansen", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {
  const { toast } = useToast();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTagline, setActiveTagline] = useState(0);

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

  const taglines = ["Making waves", "Dark frequencies", "Available everywhere"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    toast({
      title: "Message sent",
      description: "We've received your transmission. Stay tuned.",
    });
    form.reset();
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsNavOpen(false);
  };

  // Intersection Observer for fade-in animations
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    const hiddenElements = document.querySelectorAll(".fade-in-section");
    hiddenElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
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
            {["music", "videos", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="nav-link text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
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
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-white/5 py-4 px-6 flex flex-col gap-6">
            {["music", "videos", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="text-lg font-medium uppercase tracking-widest text-white hover:text-primary text-left"
              >
                {section}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full">
          <img
            src={heroBgSrc}
            alt="Ash Johansen"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="absolute inset-0 video-overlay" />

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <img
            src={logoSrc}
            alt="Ash Johansen"
            className="w-[min(80vw,560px)] h-auto mb-4"
            style={{ mixBlendMode: "screen" }}
          />
          <div className="h-12 flex items-center justify-center">
            {taglines.map((tagline, index) => (
              <p
                key={index}
                className={`absolute text-lg md:text-2xl font-light tracking-[0.2em] uppercase text-primary transition-all duration-1000 ${
                  activeTagline === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {tagline}
              </p>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Scroll</span>
          <div className="w-[1px] h-12 bg-primary/50" />
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
          <h2 className="text-5xl md:text-7xl font-display text-white mb-16 flex items-center gap-6">
            <span className="text-primary neon-text-glow">/</span> Releases
          </h2>

          {/* Track list */}
          <div className="mb-12 bg-card/30 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-display">Tracks</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-display">Preview</span>
            </div>
            {TRACKS.map((track, index) => (
              <button
                key={track.id}
                onClick={() => playTrack(index)}
                className={`w-full flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-b-0 transition-all duration-200 group text-left ${
                  currentTrackIndex === index
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-white/5"
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
                  <p className={`text-sm font-medium truncate ${currentTrackIndex === index ? "text-primary" : "text-white"}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                {currentTrackIndex === index && (
                  <div className="flex gap-[3px] items-end h-4 flex-shrink-0">
                    {[1,2,3].map((b) => (
                      <div
                        key={b}
                        className={`w-[3px] bg-primary rounded-full ${isPlaying ? "animate-pulse" : ""}`}
                        style={{ height: `${[60, 100, 75][b-1]}%`, animationDelay: `${b * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <h3 className="text-xl font-display tracking-widest mb-6 text-white">Latest Album</h3>
              {/* Replace this URL with actual Spotify embed URL */}
              <iframe
                src="https://open.spotify.com/embed/album/4aawyAB9vmqN3uQ7FjRGTy"
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-xl shadow-2xl"
                title="Spotify Player"
              ></iframe>
            </div>

            <div className="bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col justify-center">
              <h3 className="text-xl font-display tracking-widest mb-6 text-white">Featured Mix</h3>
              {/* Replace this URL with actual SoundCloud embed URL */}
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%2300f2fe&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                className="rounded-xl"
                title="SoundCloud Player"
              ></iframe>
              
              <div className="mt-8">
                <Button 
                  variant="outline" 
                  className="w-full h-14 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-widest text-lg neon-glow"
                  data-testid="button-buy-music"
                >
                  Buy Digital / Vinyl
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-32 px-6 bg-black/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
          <h2 className="text-5xl md:text-7xl font-display text-white mb-16 flex items-center gap-6">
            <span className="text-primary neon-text-glow">/</span> Visuals
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group relative aspect-video bg-muted rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-primary/50 transition-colors duration-500">
                {/* Replace this ID with actual YouTube video ID */}
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title={`YouTube video player ${item}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary transition-colors duration-500 rounded-xl mix-blend-overlay"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
          <div>
            <h2 className="text-5xl md:text-7xl font-display text-white mb-8 flex items-center gap-6">
              <span className="text-primary neon-text-glow">/</span> Identity
            </h2>
            <div className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-6">
              <p>
                Ash Johansen is an independent artist crafting raw, honest music that lives somewhere between late-night drives and the moment right before everything changes.
              </p>
              <p>
                Drawing from a wide palette of influences — alternative, indie, and the kind of pop that doesn't apologize for its hooks — Ash writes songs that feel lived-in from the first listen. Equal parts vulnerability and nerve.
              </p>
              <p>
                Currently independent and working on new music. Booking, press, and collaboration inquiries welcome.
              </p>
            </div>

            <div className="mt-12 flex gap-6">
              {/* Replace # with actual social links */}
              {[
                { Icon: SiInstagram, href: "#", name: "Instagram" },
                { Icon: SiX, href: "#", name: "X" },
                { Icon: SiSpotify, href: "#", name: "Spotify" },
                { Icon: SiYoutube, href: "#", name: "YouTube" }
              ].map(({ Icon, href, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:neon-glow transition-all duration-300"
                  aria-label={name}
                  data-testid={`link-social-${name.toLowerCase()}`}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <img 
              src={aboutImgSrc}
              alt="Ash Johansen" 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 mix-blend-overlay bg-primary/10" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-black/50 border-t border-white/5">
        <div className="max-w-3xl mx-auto fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-display text-white mb-4">
              Connect
            </h2>
            <p className="text-muted-foreground">Booking, press, or just saying hi.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-background/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80 uppercase tracking-widest text-xs">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          className="bg-black/50 border-white/10 focus:border-primary focus:ring-primary h-12"
                          data-testid="input-contact-name"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80 uppercase tracking-widest text-xs">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          {...field} 
                          className="bg-black/50 border-white/10 focus:border-primary focus:ring-primary h-12"
                          data-testid="input-contact-email"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80 uppercase tracking-widest text-xs">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What's on your mind?" 
                        className="min-h-[150px] bg-black/50 border-white/10 focus:border-primary focus:ring-primary resize-none"
                        {...field} 
                        data-testid="input-contact-message"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 bg-white text-black hover:bg-primary hover:text-primary-foreground font-display tracking-widest text-xl transition-all duration-300"
                data-testid="button-submit-contact"
              >
                Send Transmission
              </Button>
            </form>
          </Form>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-center border-t border-white/5 bg-background ${currentTrack ? "py-8 pb-28" : "py-8"}`}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-display">
          © {new Date().getFullYear()} Ash Johansen. All rights reserved.
        </p>
      </footer>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Sticky Bottom Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
            <div
              className="h-full bg-primary transition-none"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
            />
          </div>

          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => skipTrack(-1)}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                data-testid="button-player-prev"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-black hover:scale-105 transition-transform neon-glow"
                data-testid="button-player-playpause"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => skipTrack(1)}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                data-testid="button-player-next"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Seek + time */}
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

            {/* Mute */}
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
              data-testid="button-player-mute"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}