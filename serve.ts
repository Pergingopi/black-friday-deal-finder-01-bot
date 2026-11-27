// Static server for the deal finder: serves app/ at its root.
// Usage: node serve.ts [--port 8080]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(fileURLToPath(new URL(".", import.meta.url)), "app");

// Content types by file extension. Anything unlisted is served as a
// generic binary download rather than guessed at.
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Port from "--port N" (default 8080). Any other argument is ignored.
function parsePort(argv: string[]): number {
  let port = 8080;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--port" && argv[i + 1]) port = Number(argv[i + 1]);
  }
  return port;
}

// What a request path resolves to: a servable file, a path that escapes
// app/ (traversal), or a path that names nothing on disk. The two failure
// kinds stay distinct so the handler can answer 403 and 404 differently.
type ResolvedFile =
  | { kind: "ok"; file: string }
  | { kind: "forbidden" }
  | { kind: "missing" };

function resolveFile(pathname: string): ResolvedFile {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, "") || "index.html";
  const file = normalize(join(appDir, rel));
  if (file !== appDir && !file.startsWith(appDir + sep)) return { kind: "forbidden" };
  if (!existsSync(file) || !statSync(file).isFile()) return { kind: "missing" };
  return { kind: "ok", file };
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const resolved = resolveFile(url.pathname);
  if (resolved.kind === "forbidden") {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  if (resolved.kind === "missing") {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const file = resolved.file;
  res.writeHead(200, { "content-type": MIME_TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});

const port = parsePort(process.argv.slice(2));
server.listen(port, () => {
  console.log(`DealHunt serving app/ at http://localhost:${port}/`);
});
