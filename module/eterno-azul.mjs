import { ID, TYPES } from "./config.mjs";
import { actorModels, itemModels } from "./data/models.mjs";
import { EAActorSheet } from "./sheets/actor.mjs";
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
  foundry.applications.apps.DocumentSheetConfig.registerSheet(
    Actor,
    ID,
    EAActorSheet,
    {
      types: Object.keys(actorModels),
      makeDefault: true,
      label: "Eterno Azul",
    },
  );
  foundry.applications.apps.DocumentSheetConfig.registerSheet(
    Item,
    ID,
    EAItemSheet,
    { types: Object.keys(itemModels), makeDefault: true, label: "Eterno Azul" },
  );
  CONFIG.Combat.initiative = { formula: null, decimals: 0 };
  game.settings.registerMenu(ID, "tools", {
    name: "Cartografía del Azul",
    label: "Abrir herramientas",
    hint: "Desafíos de DJ, creación e importación CSB.",
    icon: "fas fa-compass",
    type: ToolsApp,
    restricted: false,
  });
  game.eternoAzul = { ChallengeApp, NavalApp, ToolsApp, request };
});
Hooks.once("ready", () => {
  setupAuthority();
  setupCards(chatAction);
  setupInvitations();
});

Hooks.on("preCreateActor", (actor, data) => {
  if (!data.img)
    actor.updateSource({
      img: `systems/eterno-azul/assets/${data.type === "surcazul" ? "ea-ship-placeholder.webp" : "ea-system-icon.png"}`,
    });
});
