import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { ClassicLevel } from "classic-level";
import archiver from "archiver";
import { createHash } from "node:crypto";
const manifest = JSON.parse(await fs.readFile("system.json"));
await fs.mkdir("packs", { recursive: true });
for (const pack of manifest.packs) {
  await fs.rm(pack.path, { recursive: true, force: true });
  const db = new ClassicLevel(pack.path, { valueEncoding: "json" });
  const source = JSON.parse(await fs.readFile(`_data/${pack.name}.json`));
  const root = { JournalEntry: "journal", Item: "items", Actor: "actors" }[
    pack.type
  ];
  for (const doc of source) {
    const copy = structuredClone(doc);
    if (pack.type === "JournalEntry") {
      const pages = copy.pages ?? [];
      copy.pages = pages.map((p) => p._id);
      for (const page of pages)
        await db.put(`!journal.pages!${copy._id}.${page._id}`, page);
    }
    await db.put(`!${root}!${copy._id}`, copy);
  }
  await db.close();
}
await fs.mkdir("dist", { recursive: true });
const out = createWriteStream("dist/eterno-azul.zip");
const zip = archiver("zip", { zlib: { level: 9 } });
zip.pipe(out);
const done = new Promise((resolve, reject) => {
  out.on("close", resolve);
  out.on("error", reject);
  zip.on("error", reject);
});
for (const path of [
  "system.json",
  "module",
  "templates",
  "styles",
  "lang",
  "packs",
  "assets",
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
]) {
  const stat = await fs.stat(path);
  if (stat.isDirectory()) zip.directory(path, `eterno-azul/${path}`);
  else zip.file(path, { name: `eterno-azul/${path}` });
}
await zip.finalize();
await done;
await fs.copyFile("system.json", "dist/system.json");
const bytes = await fs.readFile("dist/eterno-azul.zip");
await fs.writeFile(
  "dist/SHA256SUMS",
  createHash("sha256").update(bytes).digest("hex") + "  eterno-azul.zip\n",
);
console.log(`ZIP: ${bytes.length} bytes`);
