import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ★ Set YOUTUBE_CHANNEL_ID env var to enable live feed.
// Find yours at: youtube.com/@YourChannel → View Page Source → search "channelId"
const FALLBACK_IDS = ["6ZJpSVg87ic", "FlS3Eop3kp0", "Mpo-ghb5Ggs"];

router.get("/youtube-feed", async (req, res) => {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    res.json({
      videos: FALLBACK_IDS.map((id, i) => ({ id, title: `Video ${i + 1}` })),
      source: "fallback",
    });
    return;
  }

  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`Feed returned ${response.status}`);

    const xml = await response.text();

    const videoIdMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
    const titleMatches = [...xml.matchAll(/<title>([^<]+)<\/title>/g)];

    // First <title> is the channel name — skip it
    const videos = videoIdMatches.slice(0, 3).map((m, i) => ({
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
