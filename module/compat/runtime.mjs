/** Evaluated on demand: game.release is not guaranteed during module evaluation. */
export function versionInfo(game = globalThis.game) {
  const reported = Number(game?.release?.generation);
  const fallback = /^(\d+)(?:\.|$)/.exec(String(game?.version ?? ""));
  const generation =
    Number.isInteger(reported) && reported > 0
      ? reported
      : Number(fallback?.[1]) || null;
  return {
    version: game?.version ?? "unknown",
    generation,
    profile: [13, 14].includes(generation) ? `v${generation}` : "unsupported",
  };
}
export function capabilities(env = globalThis) {
  const a = env.foundry?.applications;
  return {
    applicationV2: typeof a?.api?.ApplicationV2 === "function",
    actorSheetV2: typeof a?.sheets?.ActorSheetV2 === "function",
    itemSheetV2: typeof a?.sheets?.ItemSheetV2 === "function",
    dialogV2: typeof a?.api?.DialogV2 === "function",
    handlebarsApplicationMixin:
      typeof a?.api?.HandlebarsApplicationMixin === "function",
    documentSheetConfig:
      typeof a?.apps?.DocumentSheetConfig?.registerSheet === "function",
    htmlHookElements:
      typeof env.ChatMessage?.prototype?.renderHTML === "function",
    chatAPI:
      typeof env.ChatMessage?.applyMode === "function"
        ? "applyMode"
        : typeof env.ChatMessage?.applyRollMode === "function"
          ? "applyRollMode"
          : "unavailable",
    activeEffects: typeof env.ActiveEffect === "function",
    statusEffectsFormat: Array.isArray(env.CONFIG?.statusEffects)
      ? "array"
      : env.CONFIG?.statusEffects &&
          typeof env.CONFIG.statusEffects === "object"
        ? "object"
        : "unknown",
  };
}
export function diagnostic(env = globalThis) {
  return {
    eternoAzul: env.game?.system?.version ?? "unknown",
    foundry: versionInfo(env.game),
    capabilities: capabilities(env),
  };
}
