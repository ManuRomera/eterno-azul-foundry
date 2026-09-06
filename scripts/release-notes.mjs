import fs from "node:fs/promises";
const { version } = JSON.parse(await fs.readFile("system.json"));
const text = await fs.readFile("CHANGELOG.md", "utf8");
const start = text.indexOf(`## [${version}]`);
if (start < 0) throw new Error("Faltan notas de versión");
const section = text.slice(start).split(/\n## \[/)[0];
await fs.writeFile(
  "dist/notes.md",
  section +
    "\n\nInstala con el [manifest](https://raw.githubusercontent.com/ManuRomera/eterno-azul-foundry/main/system.json). Consulta README y docs/QA.md para compatibilidad y límites verificados.\n",
);
