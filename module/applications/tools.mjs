import { diagnostic } from "../compat/runtime.mjs";
import { createMessage, rollPrivacy } from "../compat/chat.mjs";
import { onChatRender } from "../compat/hooks.mjs";
import { ID, ACTIONS } from "../config.mjs";
import { prompt, field, select, esc } from "../utils/ui.mjs";
import { ChallengeApp } from "./challenge.mjs";
import { convertActor } from "../migrations/csb.mjs";
import {
  ApplicationV2,
  HandlebarsApplicationMixin,
} from "../compat/applications.mjs";
export class ToolsApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["ea-app"],
    window: { title: "Cartografía del Azul · herramientas", resizable: true },
    position: { width: 570, height: 540 },
    actions: {
      diagnostic: ToolsApp.copyDiagnostic,
      challenge: ToolsApp.challenge,
      create: ToolsApp.create,
      import: ToolsApp.import,
    },
  };
  static PARTS = {
    body: {
      template: "systems/eterno-azul/templates/applications/tools.hbs",
      scrollable: [""],
    },
  };
  async _prepareContext() {
    return {
      isGM: game.user.isGM,
      diagnostic: JSON.stringify(diagnostic(), null, 2),
    };
  }
  static async copyDiagnostic() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(diagnostic(), null, 2),
      );
      ui.notifications.info("Diagnóstico copiado");
    } catch {
      ui.notifications.warn(
        "No se pudo acceder al portapapeles. Selecciona y copia el diagnóstico visible.",
      );
    }
  }
  static async challenge() {
    if (!game.user.isGM) return;
    const f = await prompt(
      "Plantear un Desafío",
      field("name", "Nombre") +
        field("risk", "Riesgo", 1, "number") +
        field("context", "Contexto") +
        field("consequences", "Consecuencias relevantes") +
        select("visibility", "Visibilidad", [
          ["public", "Toda la mesa"],
          ["gm", "Solo DJ"],
        ]),
    );
    if (!f) return;
    const data = {
      name: f.get("name"),
      risk: Number(f.get("risk")),
      context: f.get("context"),
      consequences: f.get("consequences"),
    };
    if (!Number.isSafeInteger(data.risk) || data.risk < 0)
      throw new Error("Riesgo inválido");
    await createMessage({
      content: `<article class="ea-chat-card"><small>DESAFÍO DE LA DJ</small><h3>${esc(data.name)}</h3><p>${esc(data.context)}</p><p>Riesgo ${data.risk}</p><p>${esc(data.consequences)}</p><button type="button" data-ea-respond>Responder con mi Buscador</button></article>`,
      whisper:
        f.get("visibility") === "gm"
          ? game.users.filter((u) => u.isGM).map((u) => u.id)
          : [],
      flags: { [ID]: { invitation: data } },
    });
  }
  static async create() {
    const f = await prompt(
      "Nuevo Buscador · identidad",
      field("name", "Nombre") +
        field("origin", "Origen") +
        field("archetype", "Arquetipo") +
        "<p>La Guía no contiene la asignación completa de creación. Copia después los dados, Señas, Aptitudes y pertrechos de tu ficha autorizada. Este asistente no asigna puntos inventados.</p>",
    );
    if (!f) return;
    const actor = await Actor.create({
      name: f.get("name") || "Nuevo Buscador",
      type: "buscador",
      img: "systems/eterno-azul/assets/compass.svg",
      system: { origin: f.get("origin"), archetype: f.get("archetype") },
    });
    actor.sheet.render({ force: true });
  }
  static async import() {
    if (!game.user.isGM) return;
    const f = await prompt(
      "Importar copia de Actor CSB",
      '<label>JSON exportado desde CSB<input type="file" name="file" accept=".json,application/json"></label>' +
        select("type", "Tipo del Actor", [
          ["buscador", "Buscador"],
          ["pnj", "PNJ"],
          ["surcazul", "Surcazul"],
        ]) +
        "<p>Conserva el archivo original. Se creará un Actor nuevo y se preservarán las propiedades originales en flags locales, sin ejecutar fórmulas.</p>",
    );
    if (!f) return;
    const file = f.get("file");
    if (!file?.size || file.size > 10000000)
      throw new Error("Selecciona un JSON de menos de 10 MB");
    const source = JSON.parse(await file.text());
    const { actor, warnings } = convertActor(source, f.get("type"));
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Revisar conversión" },
      content: `<div class="ea-dialog"><p>${esc(actor.name)} · ${actor.items.length} elementos</p><ul>${warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul><p>Crear copia nueva sin modificar el original.</p></div>`,
    });
    if (ok) {
      const created = await Actor.create(actor);
      created.sheet.render({ force: true });
    }
  }
}
export function setupInvitations() {
  onChatRender((message, root) => {
    const d = message.getFlag(ID, "invitation");
    if (!d) return;
    root
      .querySelector("[data-ea-respond]")
      ?.addEventListener("click", async () => {
        const f = await prompt(
          "Responder al Desafío",
          select(
            "actor",
            "Buscador",
            game.actors
              .filter((a) => a.type === "buscador" && a.isOwner)
              .map((a) => [a.id, a.name]),
          ) + select("action", "Acción", Object.entries(ACTIONS)),
        );
        if (f)
          new ChallengeApp(game.actors.get(f.get("actor")), f.get("action"), {
            risk: d.risk,
            context: `${d.name} · ${d.context}`,
          }).render({ force: true });
      });
  });
}
