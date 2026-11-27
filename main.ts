// Entry program: copies app/ and screenshots/ into the output directory
// and writes /output/dossier.json with buildDossier from the kit's
// vendor/makefun-frontend.ts. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output. Deterministic: the same inputs always produce the
// same bytes. The output directory itself is never removed (it may be a
// bind mount); only its contents are cleared first.
//
// The dossier is written atomically — to a temporary file in the same
// directory, then renamed over dossier.json — so a reader never sees a
// half-written file if the process dies mid-write.
import { buildDossier } from "./vendor/makefun-frontend.ts";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const repoDir = new URL(".", import.meta.url).pathname;

// Repository directories copied into the output, in order.
const INPUT_DIRS = ["app", "screenshots"];
const DOSSIER_NAME = "dossier.json";

// Empty a directory without removing the directory itself: the output
// directory may be a bind mount owned by someone else.
function clearContents(dir: string): void {
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

// Copy one repository directory into the output directory, failing loudly
// when the source is missing or is not a directory.
function copyInputDir(name: string): void {
  const src = join(repoDir, name);
  if (!existsSync(src) || !statSync(src).isDirectory()) {
    throw new Error(`missing directory in repository: ${name}/`);
  }
  cpSync(src, join(outDir, name), { recursive: true });
}

// Write text to a file in two steps — temp file in the same directory,
// then rename — so the destination is either the old complete file or the
// new complete file, never a prefix of the new one. The temp file and the
// destination share a directory, so the rename cannot cross filesystems.
function writeAtomically(dir: string, name: string, contents: string): void {
  const tmpPath = join(dir, `.${name}.tmp`);
  const finalPath = join(dir, name);
  writeFileSync(tmpPath, contents);
  renameSync(tmpPath, finalPath);
}

// Normalize modes so every output file is 0644 and every directory 0755,
// whatever the repository's own modes were. The output directory itself
// is left alone: it may be a bind mount owned by someone else, and
// chmodding it can fail for an unprivileged runner.
function normalizeModes(dir: string): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      try {
        chmodSync(p, 0o755);
      } catch {
        // Best effort: a directory the runner does not own keeps its mode.
      }
      normalizeModes(p);
    } else {
      chmodSync(p, 0o644);
    }
  }
}

mkdirSync(outDir, { recursive: true });
clearContents(outDir);
for (const name of INPUT_DIRS) copyInputDir(name);

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeAtomically(outDir, DOSSIER_NAME, dossier);
normalizeModes(outDir);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
