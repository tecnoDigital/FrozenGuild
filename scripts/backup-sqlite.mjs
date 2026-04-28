import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

function stampDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function stampTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}-${mi}-${ss}`;
}

function parseRetentionDays(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 7;
  }

  return Math.floor(parsed);
}

function applyRetention(backupDir, retentionDays) {
  const now = Date.now();
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  const removed = [];

  const files = readdirSync(backupDir, { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile()) {
      continue;
    }

    if (extname(file.name).toLowerCase() !== ".db") {
      continue;
    }

    const abs = join(backupDir, file.name);
    const ageMs = now - statSync(abs).mtimeMs;
    if (ageMs > maxAgeMs) {
      unlinkSync(abs);
      removed.push(file.name);
    }
  }

  return removed;
}

const dbPath = resolve(process.env.SQLITE_PATH ?? "./data/frozen-guild.db");
if (!existsSync(dbPath)) {
  throw new Error(`DB no encontrada: ${dbPath}`);
}

const backupDir = resolve(process.env.BACKUP_DIR ?? "./backups");
mkdirSync(backupDir, { recursive: true });

let fileName = `${basename(dbPath, ".db")}-${stampDate()}.db`;
let outPath = join(backupDir, fileName);

if (existsSync(outPath)) {
  fileName = `${basename(dbPath, ".db")}-${stampDate()}_${stampTime()}.db`;
  outPath = join(backupDir, fileName);
}

copyFileSync(dbPath, outPath);

const retentionDays = parseRetentionDays(process.env.BACKUP_RETENTION_DAYS);
const removed = applyRetention(backupDir, retentionDays);

console.log(`[backup] ok`);
console.log(`[backup] source: ${dbPath}`);
console.log(`[backup] output: ${outPath}`);
console.log(`[backup] dir: ${dirname(outPath)}`);
console.log(`[backup] retentionDays: ${retentionDays}`);
if (removed.length > 0) {
  console.log(`[backup] removed: ${removed.join(", ")}`);
}
