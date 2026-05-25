import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID || "PL6jbjn9FqoxInDO6GKY2yFljdMdSiovdf";
const FALLBACK_IDS = ["6ZJpSVg87ic", "mqWEPS37iyY", "FlS3Eop3kp0", "Mpo-ghb5Ggs", "dQw4w9WgXcQ", "Z8Z7n1r2e5s"];

router.get("/youtube-feed", async (req, res) => {
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`Feed returned ${response.status}`);

    const xml = await response.text();

    const videoIdMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
    const titleMatches = [...xml.matchAll(/<title>([^<]+)<\/title>/g)];

    // First <title> is the playlist name — skip it
    const videos = videoIdMatches.slice(0, 6).map((m, i) => ({
      id: m[1],
      title: titleMatches[i + 1]?.[1] ?? `Video ${i + 1}`,
    }));

    if (videos.length === 0) throw new Error("No videos found in feed");

    res.json({ videos, source: "live" });
  } catch (err) {
    req.log.warn({ err }, "YouTube RSS feed failed, using fallback");
    res.json({
      videos: FALLBACK_IDS.map((id, i) => ({ id, title: `Video ${i + 1}` })),
      source: "fallback",
    });
  }
});

export default router;
