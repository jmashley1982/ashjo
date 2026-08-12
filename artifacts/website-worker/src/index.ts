interface Env {
  ASSETS: Fetcher;
  YOUTUBE_PLAYLIST_ID: string;
  INSTAGRAM_ACCESS_TOKEN?: string;
}

// Keep in sync with the frontend's FALLBACK_VIDEO_IDS in artist-site/src/pages/Home.tsx
const FALLBACK_VIDEOS = [
  { id: "7gbCnCOREBk", title: 'Ash Johansen – "White Truck" (Official Music Video)' },
  { id: "F9Ucr687l3s", title: 'Ash Johansen – "RDY2DIE" (Official Music Video)' },
  { id: "6ZJpSVg87ic", title: 'Ash Johansen – "TM2YL" (Official Music Video)' },
];

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "frame-src https://www.youtube.com https://open.spotify.com https://w.soundcloud.com https://embed.music.apple.com https://music.youtube.com",
    "connect-src 'self'",
    "media-src 'self'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function json(data: unknown, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function handleHealthCheck(): Promise<Response> {
  return json({ status: "ok" });
}

async function handleYoutubeFeed(env: Env): Promise<Response> {
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${env.YOUTUBE_PLAYLIST_ID}`;
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`Feed returned ${response.status}`);

    const xml = await response.text();

    const videoIdMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
    const titleMatches = [...xml.matchAll(/<title>([^<]+)<\/title>/g)];

    // First <title> is the playlist name — skip it
    const videos = videoIdMatches.slice(0, 3).map((m, i) => ({
      id: m[1],
      title: decodeXmlEntities(titleMatches[i + 1]?.[1] ?? FALLBACK_VIDEOS[i]?.title ?? `Video ${i + 1}`),
    }));

    if (videos.length === 0) throw new Error("No videos found in feed");

    return json({ videos, source: "live" });
  } catch {
    return json({ videos: FALLBACK_VIDEOS, source: "fallback" });
  }
}

async function handleInstagramFeed(env: Env): Promise<Response> {
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return json({ posts: [] });
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption&limit=12&access_token=${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!response.ok) throw new Error(`Instagram API returned ${response.status}`);

    const data = (await response.json()) as {
      data: Array<{ id: string; media_type: string; media_url?: string; caption?: string }>;
    };

    const posts = (data.data ?? [])
      .filter((p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM")
      .slice(0, 8)
      .map((p) => ({ imageUrl: p.media_url ?? "", caption: p.caption ?? "" }));

    return json({ posts });
  } catch {
    return json({ posts: [] });
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    let response: Response;
    if (url.pathname === "/api/healthz") {
      response = await handleHealthCheck();
    } else if (url.pathname === "/api/youtube-feed") {
      response = await handleYoutubeFeed(env);
    } else if (url.pathname === "/api/instagram-feed") {
      response = await handleInstagramFeed(env);
    } else {
      response = await env.ASSETS.fetch(request);
    }

    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;
