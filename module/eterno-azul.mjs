import {
  migrateWorldIdentities,
  migrateIdentity,
} from "./migrations/identity.mjs";
import { diagnostic, versionInfo } from "./compat/runtime.mjs";
import { DocumentSheetConfig } from "./compat/applications.mjs";
import { ID, TYPES } from "./config.mjs";
import { actorModels, itemModels } from "./data/models.mjs";
import {
  EABuscadorSheet,
  EANPCSheet,
  EASurcazulSheet,
} from "./sheets/actor.mjs";
import { EAItemSheet } from "./sheets/item.mjs";
import { ChallengeApp, chatAction } from "./applications/challenge.mjs";
import { NavalApp } from "./applications/naval.mjs";
import { ToolsApp, setupInvitations } from "./applications/tools.mjs";
import { setupAuthority, request } from "./documents/operations.mjs";
import { setupCards } from "./chat/cards.mjs";
Hooks.once("init", () => {
  CONFIG.Actor.dataModels = Object.assign(CONFIG.Actor.dataModels, actorModels);
  CONFIG.Item.dataModels = Object.assign(CONFIG.Item.dataModels, itemModels);
  CONFIG.Actor.typeLabels = {
    buscador: "EA.Actor.buscador",
    pnj: "EA.Actor.pnj",
    surcazul: "EA.Actor.surcazul",
  };
  CONFIG.Item.typeLabels = Object.fromEntries(
    Object.keys(TYPES).map((k) => [k, `EA.Item.${k}`]),
  );
  for (const [type, sheet] of Object.entries({
    buscador: EABuscadorSheet,
    pnj: EANPCSheet,
    surcazul: EASurcazulSheet,
  })) {
    DocumentSheetConfig.registerSheet(Actor, ID, sheet, {
      types: [type],
      makeDefault: true,
      label: "Eterno Azul",
    });
  }
  DocumentSheetConfig.registerSheet(Item, ID, EAItemSheet, {
    types: Object.keys(itemModels),
    makeDefault: true,
    label: "Eterno Azul",
  });
  CONFIG.Combat.initiative = { formula: null, decimals: 0 };
  game.settings.registerMenu(ID, "tools", {
    name: "Cartografía del Azul",
    label: "Abrir herramientas",
    hint: "Desafíos de DJ, creación e importación CSB.",
    icon: "fas fa-compass",
    type: ToolsApp,
    restricted: false,
  });
  game.eternoAzul = { ChallengeApp, NavalApp, ToolsApp, request, diagnostic };
});
Hooks.once("ready", async () => {
  const v = versionInfo();
  console.info(
    `Eterno Azul ${game.system.version} · Foundry ${v.version} · compatibility profile ${v.profile}`,
  );
  setupAuthority();
  setupCards(chatAction);
  setupInvitations();
  try {
    await migrateWorldIdentities();
  } catch (e) {
    ui.notifications.error(
      `No se pudo completar la migración de identidad: ${e.message}`,
    );
  }
});

Hooks.on("preCreateActor", (actor, data) => {
  if (!data.img)
    actor.updateSource({
      img: `systems/eterno-azul/assets/${data.type === "surcazul" ? "ea-ship-placeholder.webp" : "ea-system-icon.png"}`,
    });
});

Hooks.on("createActor", async (actor) => {
  if (game.users.activeGM?.id === game.user.id) {
    try {
      await migrateIdentity(actor);
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
});
