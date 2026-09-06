/** Explicit recipients avoid applying the active GM's identity to a player's request.
 * user/whisper/blind are public creation fields in both v13 and v14.
 * messageMode is a core UI setting, not a persisted mechanical flag.
 */
export function rollPrivacy(mode, authorId, gmIds) {
  if (!["publicroll", "gmroll", "blindroll", "selfroll"].includes(mode))
    throw new Error("Visibilidad de tirada desconocida");
  return {
    user: authorId,
    blind: mode === "blindroll",
    whisper:
      mode === "publicroll"
        ? []
        : mode === "selfroll"
          ? [authorId]
          : mode === "blindroll"
            ? [...new Set(gmIds)]
            : [...new Set([...gmIds, authorId])],
  };
}
export function createMessage(data, options) {
  return ChatMessage.create(data, options);
}
