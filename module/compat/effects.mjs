import { capabilities, versionInfo } from "./runtime.mjs";
/** Format a future semantic catalogue; never replaces the core catalogue on startup. */
export function statusEffectsData(definitions, env = globalThis) {
  const format = capabilities(env).statusEffectsFormat;
  const rows = definitions.map((d) => ({ ...d }));
  if (
    new Set(rows.map((d) => d.id)).size !== rows.length ||
    rows.some((d) => !d.id)
  )
    throw new Error("Identificadores de estado inválidos");
  return format === "array" ||
    (format === "unknown" && versionInfo(env.game).generation === 13)
    ? rows
    : Object.fromEntries(rows.map((d) => [d.id, d]));
}
