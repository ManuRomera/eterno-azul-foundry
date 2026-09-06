import { identityItem, migrateIdentity } from "../migrations/identity.mjs";
import { ID, ACTIONS, TYPES, DISTANCES } from "../config.mjs";
import { DICE } from "../rules/challenge.mjs";
import { ChallengeApp } from "../applications/challenge.mjs";
import { NavalApp } from "../applications/naval.mjs";
import { request } from "../documents/operations.mjs";
import { prompt, field, select, check, esc } from "../utils/ui.mjs";
import {
  HandlebarsApplicationMixin,
  ActorSheetV2,
} from "../compat/applications.mjs";
export class EAActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  constructor(options) {
    const key = `ea.${game.world.id}.${game.user.id}.${options.document.uuid}`;
    let prefs = {};
    try {
      prefs = JSON.parse(localStorage.getItem(key) || "{}");
    } catch {}
    super({ ...options, position: { ...prefs.position, ...options.position } });
    this.prefKey = key;
    this.prefs = prefs;
    this.tab = prefs.tab ?? "play";
  }
  static DEFAULT_OPTIONS = {
    classes: ["ea-app", "ea-actor"],
    position: { width: 880, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      identity: EAActorSheet.identity,
      tab: EAActorSheet.tab,
      roll: EAActorSheet.roll,
      die: EAActorSheet.die,
      create: EAActorSheet.create,
      edit: EAActorSheet.edit,
      remove: EAActorSheet.remove,
      toggle: EAActorSheet.toggle,
      brio: EAActorSheet.brio,
      damage: EAActorSheet.damage,
      rest: EAActorSheet.rest,
      naval: EAActorSheet.naval,
      crew: EAActorSheet.crew,
      compact: EAActorSheet.compact,
    },
  };
  static PARTS = {
    header: { template: "systems/eterno-azul/templates/actors/header.hbs" },
    body: {
      template: "systems/eterno-azul/templates/actors/buscador/body.hbs",
      templates: [
        "common/tabs.hbs",
        "common/health-features.hbs",
        "common/inventory.hbs",
        "common/notes.hbs",
        "buscador/sidebar.hbs",
        "buscador/actions.hbs",
        "pnj/sidebar.hbs",
        "surcazul/sidebar.hbs",
      ].map((p) => `systems/eterno-azul/templates/actors/${p}`),
      scrollable: [""],
    },
  };
  async _prepareContext(o) {
    const a = this.actor,
      s = a.system,
      limited = !a.testUserPermission(game.user, "OBSERVER");
    return {
      ...(await super._prepareContext(o)),
      limited,
      name: a.name,
      img: a.img,
      system: s,
      type: a.type,
      origin: identityItem(a, "origin"),
      archetype: identityItem(a, "archetype"),
      isPC: a.type === "buscador",
      isNPC: a.type === "pnj",
      isShip: a.type === "surcazul",
      compact: this.prefs.compact,
      play: this.tab === "play",
      inventory: this.tab === "inventory",
      notes: this.tab === "notes",
      isGM: game.user.isGM,
      actions: limited
        ? []
        : Object.entries(ACTIONS).map(([key, label]) => ({
            key,
            label,
            die: s.actions?.[key] || "—",
            related: a.items
              .filter(
                (i) =>
                  i.system.effect?.actions?.includes(key) ||
                  i.system.affectedActions?.includes(key),
              )
              .map((i) => i.name)
              .join(" · "),
          })),
      pips: s.brio
        ? Array.from(
            { length: Math.max(s.brio.max, s.brio.value) },
            (_, i) => ({ filled: i < s.brio.value }),
          )
        : [],
      signs: a.items.filter((i) => i.type === "sena"),
      bonds: a.items.filter((i) => i.type === "vinculo"),
      features: a.items.filter((i) =>
        [
          "aptitud",
          "origen",
          "arquetipo",
          "mejora",
          "verbo",
          "ritual",
        ].includes(i.type),
      ),
      conditions: a.items.filter(
        (i) =>
          ["herida", "desperfecto", "condicion"].includes(i.type) &&
          (game.user.isGM || i.system.visibility !== "gm"),
      ),
      items: a.items
        .filter((i) => i.system.bulk !== undefined)
        .sort((a, b) => a.sort - b.sort)
        .map((i) => ({
          id: i.id,
          name: i.name,
          img: i.img,
          type: TYPES[i.type],
          system: i.system,
        })),
      types: Object.entries(TYPES).map(([id, label]) => ({ id, label })),
      navalDistance: s.naval ? DISTANCES[s.naval.distance] : "",
      navalRival:
        !limited && s.naval?.opponentUuid
          ? ((await fromUuid(s.naval.opponentUuid))?.name ??
            "Rival no disponible")
          : "Sin rival seleccionado",
      ammo: a.items
        .filter((i) => i.type === "municion")
        .reduce((sum, i) => sum + i.system.quantity, 0),
      batteries: a.items.filter((i) => i.type === "bateria"),
      shipStats: [
        ["maneuver", "Maniobra"],
        ["sail", "Vela"],
        ["power", "Potencia"],
        ["hold", "Bodega"],
        ["hull", "Casco"],
      ].map(([key, label]) => ({ key, label, value: s[key] })),
    };
  }
  _onRender(c, o) {
    super._onRender(c, o);
    this.element.classList.toggle("ea-compact", Boolean(this.prefs.compact));
    const search = this.element.querySelector("[data-ea-search]");
    search?.addEventListener("input", () => {
      const query = search.value.toLocaleLowerCase();
      for (const row of this.element.querySelectorAll("[data-inventory-row]"))
        row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
    });
    for (const d of this.element.querySelectorAll("details[data-section]")) {
      if (this.prefs.sections?.[d.dataset.section] !== undefined)
        d.open = this.prefs.sections[d.dataset.section];
      d.addEventListener("toggle", () => {
        this.prefs.sections ??= {};
        this.prefs.sections[d.dataset.section] = d.open;
        this.savePrefs();
      });
    }
  }
  savePrefs() {
    localStorage.setItem(
      this.prefKey,
      JSON.stringify({
        ...this.prefs,
        tab: this.tab,
        position: { width: this.position.width, height: this.position.height },
      }),
    );
  }
  async close(o) {
    this.savePrefs();
    return super.close(o);
  }
  static async identity(e, t) {
    if (!this.isEditable) return;
    await migrateIdentity(this.actor);
    const key = t.dataset.key,
      type = key === "origin" ? "origen" : "arquetipo";
    const items = this.actor.items.filter((i) => i.type === type);
    let item = identityItem(this.actor, key);
    if (items.length > 1) {
      const f = await prompt(
        "Identidad del Buscador",
        select(
          "id",
          "Seleccionar",
          items.map((i) => [i.id, i.name]),
          item?.id,
        ),
      );
      if (!f) return;
      item = this.actor.items.get(f.get("id"));
    }
    if (!item)
      [item] = await this.actor.createEmbeddedDocuments("Item", [
        { name: type === "origen" ? "Nuevo Origen" : "Nuevo Arquetipo", type },
      ]);
    await this.actor.update({ [`system.identity.${key}Id`]: item.id });
    item.sheet.render({ force: true });
  }
  static async tab(e, t) {
    this.tab = t.dataset.tab;
    this.savePrefs();
    await this.render({ parts: ["body"] });
  }
  static async compact() {
    this.prefs.compact = !this.prefs.compact;
    this.savePrefs();
    await this.render();
  }
  static roll(e, t) {
    if (this.actor.isOwner)
      new ChallengeApp(this.actor, t.dataset.key ?? "armonizar", {
        manual: e.shiftKey,
      }).render({ force: true });
  }
  static async die(e, t) {
    if (!this.isEditable) return;
    const key = t.dataset.key,
      current = this.actor.system.actions[key],
      next = [0, ...DICE][([0, ...DICE].indexOf(current) + 1) % 6];
    await this.actor.update({ [`system.actions.${key}`]: next });
  }
  static async create(e, t) {
    if (!this.isEditable) return;
    let type = t.dataset.type;
    if (!type) {
      const f = await prompt(
        "Añadir elemento",
        select("type", "Tipo", Object.entries(TYPES)),
      );
      if (!f) return;
      type = f.get("type");
    }
    const [i] = await this.actor.createEmbeddedDocuments("Item", [
      {
        name: `Nueva ${TYPES[type]}`,
        type,
        img: "systems/eterno-azul/assets/compass.svg",
      },
    ]);
    i.sheet.render({ force: true });
  }
  static edit(e, t) {
    this.actor.items
      .get(t.closest("[data-item-id]").dataset.itemId)
      ?.sheet.render({ force: true });
  }
  static async remove(e, t) {
    if (!this.isEditable) return;
    const id = t.closest("[data-item-id]").dataset.itemId;
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Eliminar elemento" },
      content: `<p>¿Eliminar ${esc(this.actor.items.get(id).name)}?</p>`,
    });
    if (ok) await this.actor.deleteEmbeddedDocuments("Item", [id]);
  }
  static async toggle(e, t) {
    if (!this.isEditable) return;
    const item = this.actor.items.get(
      t.closest("[data-item-id]").dataset.itemId,
    );
    const path = t.dataset.path;
    await item.update({
      [`system.${path}`]: !foundry.utils.getProperty(item.system, path),
    });
  }
  static async brio() {
    if (!this.isEditable) return;
    const f = await prompt(
      "Bríos",
      select("use", "Uso", [
        ["narrative", "Introducir elemento narrativo · 1 Brío"],
        ["consequence", "Reducir consecuencia narrativa · 1 Brío"],
        ["aptitude", "Activar Aptitud (coste propio)"],
      ]) +
        select(
          "item",
          "Aptitud",
          this.actor.items
            .filter((i) => i.system.effect?.cost > 0)
            .map((i) => [i.id, i.name]),
        ) +
        "<p>Acuerda el efecto con la DJ. Para daño usa Gestionar daño; para repetir usa la tarjeta del Desafío.</p>",
    );
    if (f)
      await request("brio", this.actor, {
        use: f.get("use"),
        itemId: f.get("item"),
      });
  }
  static async damage() {
    if (!this.isEditable) return;
    const pc = this.actor.type === "buscador";
    const f = await prompt(
      "Gestionar daño",
      field("amount", "Daño recibido", 1, "number") +
        field("name", "Descripción de Herida/Desperfecto") +
        (pc
          ? check("brio", "Gastar 1 Brío · mitad (daño de consecuencia)") +
            check(
              "defense",
              "Gastar 1 Defensa · mitad (fuente física permitida)",
            )
          : "") +
        check("wound", "Convertir daño en Herida/Desperfecto") +
        check("fatal", "DJ confirma muerte/destrucción si es la cuarta"),
    );
    if (f)
      await request("damage", this.actor, {
        amount: Number(f.get("amount")),
        name: f.get("name"),
        brio: f.has("brio"),
        defense: f.has("defense"),
        wound: f.has("wound"),
        acceptFatal: f.has("fatal"),
      });
  }
  static async rest() {
    if (!this.isEditable) return;
    const f = await prompt(
      "Descanso seguro",
      select("kind", "Tipo", [
        ["breather", "Respiro · aproximadamente una hora"],
        ["rest", "Descanso · sueño de al menos seis horas"],
      ]) + check("safe", "Confirmo que el entorno es seguro y tranquilo"),
    );
    if (f?.has("safe"))
      await request("rest", this.actor, { kind: f.get("kind") });
  }
  static async crew() {
    if (!this.isEditable) return;
    const crew = this.actor.system.crew;
    if (!crew.length)
      return ui.notifications.info("Arrastra un Actor para añadir tripulantes");
    const pick = await prompt(
      "Tripulación",
      select(
        "index",
        "Tripulante",
        crew.map((c, i) => [i, c.name]),
      ),
    );
    if (!pick) return;
    const index = Number(pick.get("index")),
      member = crew[index];
    if (!member) return;
    const f = await prompt(
      member.name,
      field("role", "Puesto", member.role) +
        check("present", "A bordo", member.present) +
        check("remove", "Desembarcar"),
    );
    if (!f) return;
    const rows = crew.map((c) => ({ ...c }));
    if (f.has("remove")) rows.splice(index, 1);
    else
      rows[index] = {
        ...member,
        role: f.get("role"),
        present: f.has("present"),
      };
    await this.actor.update({ "system.crew": rows });
  }
  static naval() {
    new NavalApp(this.actor).render({ force: true });
  }
  async _onDropActor(e, actor) {
    if (!this.isEditable) return null;
    if (this.actor.type === "surcazul") {
      if (!this.actor.system.crew.some((c) => c.uuid === actor.uuid))
        await this.actor.update({
          "system.crew": [
            ...this.actor.system.crew,
            { uuid: actor.uuid, name: actor.name, role: "", present: true },
          ],
        });
    } else if (this.actor.type === "buscador") {
      await this.actor.createEmbeddedDocuments("Item", [
        {
          name: `Mi vínculo con ${actor.name}`,
          type: "vinculo",
          img: actor.img,
          system: {
            targetUuid: actor.uuid,
            targetName: actor.name,
            targetImg: actor.img,
          },
        },
      ]);
    }
    return actor;
  }
}

// Each type owns its body composition while shared interactions remain in the base.
export class EABuscadorSheet extends EAActorSheet {}
export class EANPCSheet extends EAActorSheet {
  static DEFAULT_OPTIONS = { position: { width: 650, height: 700 } };
  static PARTS = {
    ...EAActorSheet.PARTS,
    body: {
      ...EAActorSheet.PARTS.body,
      template: "systems/eterno-azul/templates/actors/pnj/body.hbs",
    },
  };
}
export class EASurcazulSheet extends EAActorSheet {
  static PARTS = {
    ...EAActorSheet.PARTS,
    body: {
      ...EAActorSheet.PARTS.body,
      template: "systems/eterno-azul/templates/actors/surcazul/body.hbs",
    },
  };
}
