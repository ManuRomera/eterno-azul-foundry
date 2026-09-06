// Shared public V2 APIs exist in 13.351 and 14; no V1 fallback.
const a = globalThis.foundry?.applications;
export const ApplicationV2 = a?.api?.ApplicationV2;
export const HandlebarsApplicationMixin = a?.api?.HandlebarsApplicationMixin;
export const ActorSheetV2 = a?.sheets?.ActorSheetV2;
export const ItemSheetV2 = a?.sheets?.ItemSheetV2;
export const DialogV2 = a?.api?.DialogV2;
export const DocumentSheetConfig = a?.apps?.DocumentSheetConfig;
if (
  ![
    ApplicationV2,
    ActorSheetV2,
    ItemSheetV2,
    DialogV2,
    HandlebarsApplicationMixin,
  ].every((v) => typeof v === "function")
)
  throw new Error(
    "Eterno Azul necesita las APIs V2 de Foundry 13.351 o posterior.",
  );
