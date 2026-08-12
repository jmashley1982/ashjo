import app from "./app";
import { logger } from "./lib/logger";

// PORT used to be injected by the hosting platform; it now defaults so
// `pnpm run dev` works with no environment set up.
const rawPort = process.env["PORT"];

const port = rawPort ? Number(rawPort) : 8080;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
