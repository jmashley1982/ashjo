import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Menu, X } from "lucide-react";
import { SiInstagram, SiSpotify, SiYoutube, SiX } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
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

export default function Home() {
  const { toast } = useToast();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTagline, setActiveTagline] = useState(0);

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
            className="text-2xl font-display uppercase tracking-widest text-white hover:text-primary transition-colors"
            data-testid="link-home"
          >
            N3XUS
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
        {/* Replace this ID with actual YouTube video ID */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&showinfo=0&rel=0"
            className="w-[300vw] h-[300vh] -translate-x-[100vw] -translate-y-[100vh] sm:w-[150vw] sm:h-[150vh] sm:-translate-x-[25vw] sm:-translate-y-[25vh] object-cover opacity-50"
            allow="autoplay; encrypted-media"
            title="Background Video"
          />
        </div>
        <div className="absolute inset-0 video-overlay" />

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-display text-white leading-none tracking-tighter mb-4 neon-text-glow">
            N3XUS
          </h1>
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
                Emerging from the underground electronic scene, N3XUS builds immersive sonic landscapes that blur the line between organic emotion and digital precision.
              </p>
              <p>
                What started as late-night experiments in a cramped London apartment has evolved into a fully realized audio-visual project, pulling influences from synthwave, industrial techno, and ambient scores. The sound is characterized by punishing basslines, ethereal pads, and an unwavering commitment to atmosphere.
              </p>
              <p>
                Following the breakout success of the debut EP "Terminal Systems," N3XUS is currently finalizing the highly anticipated full-length project.
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
              src="https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=2000&auto=format&fit=crop" 
              alt="Artist in studio" 
              className="w-full h-full object-cover filter contrast-125 brightness-75 grayscale"
            />
            <div className="absolute inset-0 mix-blend-overlay bg-primary/20" />
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
      <footer className="py-8 text-center border-t border-white/5 bg-background">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-display">
          © {new Date().getFullYear()} N3XUS. All frequencies reserved.
        </p>
      </footer>
    </div>
  );
}