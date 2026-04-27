import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";

const input = process.argv[2];
if (!input) {
  throw new Error("Uso: npm run restore:sqlite -- <ruta-backup.db>");
}

const backupPath = resolve(input);
if (!existsSync(backupPath)) {
  throw new Error(`Backup no encontrado: ${backupPath}`);
}

const backupStat = statSync(backupPath);
if (!backupStat.isFile()) {
  throw new Error(`Ruta no es archivo: ${backupPath}`);
}

if (extname(backupPath).toLowerCase() !== ".db") {
  throw new Error(`Archivo invalido para restore (se esperaba .db): ${backupPath}`);
}

const dbPath = resolve(process.env.SQLITE_PATH ?? "./data/frozen-guild.db");
const beforePath = `${dbPath}.before-restore-${Date.now()}.bak`;

mkdirSync(dirname(dbPath), { recursive: true });

if (existsSync(dbPath)) {
  copyFileSync(dbPath, beforePath);
}

copyFileSync(backupPath, dbPath);

console.log(`[restore] ok`);
console.log(`[restore] input: ${backupPath}`);
console.log(`[restore] db: ${dbPath}`);
if (existsSync(beforePath)) {
  console.log(`[restore] previous-db-backup: ${basename(beforePath)}`);
}
