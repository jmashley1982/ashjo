import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the first proxy hop (the hosting reverse proxy sets X-Forwarded-For)
app.set("trust proxy", 1);

// Extra allowed origins for whatever host this runs on, as a comma-separated
// list of full origins, e.g. ALLOWED_ORIGINS="https://api.example.com".
const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Allow the cPanel-hosted site to call the API
allowedOrigins.push("https://www.ashjo.com", "https://ashjo.com");

// In development allow localhost on any port
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost");
}

app.use(
  helmet({
    // Allow YouTube iframes in the video section
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        frameSrc: [
          "https://www.youtube.com",
          "https://open.spotify.com",
          "https://w.soundcloud.com",
          "https://embed.music.apple.com",
          "https://music.youtube.com",
        ],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
      },
    },
  }),
);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Rate-limit the external-facing API endpoints (100 req / 15 min per IP)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json());
// extended: false uses Node's built-in querystring (avoids qs) — adequate for GET-only API
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

export default app;
