import fs from "node:fs";
import path from "node:path";

const CSS_DIR = path.resolve("css");
const REM_BASE = 16;
const SKIP_FILES = new Set(["_functions.scss", "variables.scss"]);

function toRem(px) {
  const value = Number(px);
  if (value === 0) return "0";
  const rem = value / REM_BASE;
  const rounded = Math.round(rem * 10000) / 10000;
  return `${rounded}rem`.replace(/(\.\d*?)0+rem$/, "$1rem").replace(/\.rem$/, "rem");
}

function convertPxToRem(content) {
  const mediaBlocks = [];

  const protectedContent = content.replace(/@media\s*\([^)]+\)/g, (match) => {
    const token = `__MEDIA_${mediaBlocks.length}__`;
    mediaBlocks.push(match);
    return token;
  });

  const converted = protectedContent.replace(/(\d+(?:\.\d+)?)px/g, (match, num) => toRem(num));

  return mediaBlocks.reduce(
    (result, block, index) => result.replace(`__MEDIA_${index}__`, block),
    converted
  );
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.name.endsWith(".scss")) {
      files.push(fullPath);
    }
  }

  return files;
}

let changed = 0;

for (const file of walk(CSS_DIR)) {
  const name = path.basename(file);
  if (SKIP_FILES.has(name)) continue;

  const original = fs.readFileSync(file, "utf8");
  const updated = convertPxToRem(original);

  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed += 1;
    console.log(`updated: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`Done. ${changed} file(s) updated.`);
