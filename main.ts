import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Resolve POST.json beside this file, never from the working directory,
// so `node main.ts` works from any cwd.
const dir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(dir, "POST.json"), "utf8");
const post = JSON.parse(raw);
// Normalize: a pasted Share link can carry tracking params (?a=...&s=...);
// the canonical post address is the URL without query or fragment.
const url = String(post.url).split("?")[0].split("#")[0];

if (typeof url !== "string" || !url.startsWith("https://x.com/") || !url.includes("/status/")) {
  console.error("POST.json url must be an https://x.com/<handle>/status/<id> address");
  process.exit(1);
}

const match = url.match(/^https:\/\/x\.com\/([^/]+)\/status\/(\d+)/);
if (!match) {
  console.error("POST.json url must carry a handle and a numeric status id");
  process.exit(1);
}

// Copy POST.json to the output dir (the house reads it from there for the
// gate). MAKEFUN_OUTPUT_DIR overrides the default /output when set.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "POST.json"), raw, "utf8");

console.log("post_url:", url);
console.log("handle:", match[1]);
console.log("status_id:", match[2]);
console.log("copied POST.json to:", join(outDir, "POST.json"));
console.log("OK");
