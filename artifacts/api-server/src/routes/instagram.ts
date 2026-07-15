import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/instagram-feed", async (req, res) => {
  const token = process.env["INSTAGRAM_ACCESS_TOKEN"];
  if (!token) {
    req.log.warn("INSTAGRAM_ACCESS_TOKEN not set — returning empty feed");
    res.json({ posts: [] });
    return;
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption&limit=12&access_token=${token}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!response.ok) throw new Error(`Instagram API returned ${response.status}`);

    const data = (await response.json()) as {
      data: Array<{
        id: string;
        media_type: string;
        media_url?: string;
        thumbnail_url?: string;
        caption?: string;
      }>;
    };

    const posts = (data.data ?? [])
      .filter((p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM")
      .slice(0, 8)
      .map((p) => ({
        imageUrl: p.media_url ?? "",
        caption: p.caption ?? "",
      }));

    res.json({ posts });
  } catch (err) {
    req.log.warn({ err }, "Instagram feed fetch failed — returning empty feed");
    res.json({ posts: [] });
  }
});

export default router;
