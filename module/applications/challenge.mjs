import { ID, ACTIONS } from "../config.mjs";
import { buildPool } from "../rules/challenge.mjs";
import { request } from "../documents/operations.mjs";
import { prompt, select, check, esc } from "../utils/ui.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class ChallengeApp extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, action = "armonizar", options = {}) {
    super();
    this.actor = actor;
    this.action = action;
    this.defaults = options;
  }
  static DEFAULT_OPTIONS = {
    id: "ea-challenge-{id}",
    classes: ["ea-app"],
    tag: "form",
    window: { title: "Construir Desafío", resizable: true },
    position: { width: 560, height: 680 },
    form: { handler: ChallengeApp.submit, closeOnSubmit: false },
    actions: { forced: ChallengeApp.force },
  };
  static PARTS = {
    body: {
      template: "systems/eterno-azul/templates/applications/challenge.hbs",
      scrollable: [""],
    },
  };
  async _prepareContext() {
    return {
      actor: this.actor.name,
      action: this.action,
      actions: Object.entries(ACTIONS).map(([id, label]) => ({
        id,
        label,
        selected: id === this.action,
      })),
      signs: this.actor.items
        .filter((i) => i.type === "sena")
        .map((i) => ({ id: i.id, name: i.name, die: i.system.die })),
      effects: this.actor.items
        .filter(
          (i) =>
            ["copyAction", "advantage", "increase", "decrease"].includes(
              i.system.effect?.kind,
            ) &&
            i.system.effect?.citation &&
            i.system.active !== false,
        )
        .map((i) => ({
          id: i.id,
          name: i.name,
          trigger: i.system.effect.trigger,
        })),
      wounds: this.actor.items.filter(
        (i) => i.type === "herida" && i.system.active,
      ),
      risk: this.defaults.risk ?? 1,
      manual: this.defaults.manual ?? false,
      context: this.defaults.context ?? "",
      shifts: this.defaults.shifts ?? 0,
    };
  }
  _onRender(context, options) {
    super._onRender(context, options);
    this._inputAbort?.abort();
    this._inputAbort = new AbortController();
    this.element.addEventListener("input", () => this.preview(), {
      signal: this._inputAbort.signal,
    });
    this.preview();
  }
  data() {
    const f = new FormData(this.element);
    const advantages = [];
    for (const category of ["gear", "condition", "ally", "circumstance"]) {
      const label = String(f.get(category) || "").trim();
      if (label) advantages.push({ category, label });
    }
    const n = Number(f.get("shifts"));
    return {
      action: f.get("action"),
      signId: f.get("signId"),
      risk: Number(f.get("risk")),
      copies: Number(f.get("copies")),
      advantages,
      effects: f.getAll("effect"),
      wounds: f.getAll("wound"),
      shifts: Array.from({ length: Math.min(20, Math.abs(n)) }, () => ({
        direction: Math.sign(n),
      })),
      manual: f.get("manual")
        ? String(f.get("dice"))
            .split(/[ ,+]+/)
            .filter(Boolean)
            .map((v) => Number(v.replace(/^1?d/, "")))
        : null,
      bravata: f.get("bravata"),
      context: f.get("context"),
      rollMode: f.get("rollMode"),
    };
  }
  preview() {
    const output = this.element.querySelector("[data-preview]");
    try {
      const p = this.data();
      let copies = p.copies,
        advantages = [...p.advantages],
        shifts = [...p.shifts];
      for (const id of p.effects) {
        const item = this.actor.items.get(id),
          e = item.system.effect;
        if (e.kind === "copyAction") copies++;
        if (e.kind === "advantage")
          advantages.push({
            category: item.type === "condicion" ? "condition" : "aptitude",
            label: item.name,
          });
        if (["increase", "decrease"].includes(e.kind))
          shifts.push({ direction: e.kind === "increase" ? 1 : -1 });
      }
      p.wounds.forEach(() => shifts.push({ direction: -1 }));
      if (p.bravata) advantages.push({ category: "bravata", label: "Bravata" });
      const built = buildPool({
        action: this.actor.system.actions[p.action],
        sign: this.actor.items.get(p.signId)?.system.die ?? 6,
        copies,
        advantages,
        shifts,
        manual: p.manual,
      });
      output.textContent = `${built.formula} · Riesgo ${p.risk + built.riskBonus}`;
    } catch (e) {
      output.textContent = e.message;
    }
  }
  static async submit() {
    try {
      await request("roll", this.actor, this.data());
      await this.close();
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
  static async force() {
    try {
      await request("roll", this.actor, { ...this.data(), forced: true });
      await this.close();
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
}
export async function chatAction(action, message) {
  const d = message.getFlag(ID, "challenge");
  if (action === "assist") {
    const actors = game.actors.filter(
      (a) => a.type === "buscador" && a.isOwner && a.uuid !== d.actorUuid,
    );
    const bonds = actors.flatMap((a) =>
      a.items
        .filter(
          (i) =>
            i.type === "vinculo" &&
            !i.system.exhausted &&
            i.system.targetUuid === d.actorUuid,
        )
        .map((i) => ({ actor: a, item: i })),
    );
    if (!bonds.length)
      throw new Error(
        "No tienes un Vínculo disponible dirigido a este Buscador",
      );
    const f = await prompt(
      "Ayudar con Vínculo",
      select(
        "bond",
        "Vínculo aplicable",
        bonds.map((b) => [b.item.uuid, `${b.actor.name} · ${b.item.name}`]),
      ),
    );
    if (!f) return;
    const b = bonds.find((b) => b.item.uuid === f.get("bond"));
    return request("assist", b.actor, {
      messageId: message.id,
      bondId: b.item.id,
    });
  }
  const actor = await fromUuid(d.actorUuid);
  if (!actor?.isOwner)
    throw new Error("Solo el propietario puede repetir este Desafío");
  if (action === "reroll")
    return request("reroll", actor, {
      messageId: message.id,
      revision: d.revision,
    });
  const apt = actor.items.filter(
    (i) =>
      ["rerollOnes", "selectiveBrio"].includes(i.system.effect?.kind) &&
      i.system.effect.citation,
  );
  if (!apt.length)
    throw new Error("Añade una Aptitud o arma con repetición documentada");
  const f = await prompt(
    "Repetición selectiva",
    select(
      "aptitude",
      "Aptitud aplicable",
      apt.map((i) => [i.id, i.name]),
    ) +
      d.results
        .map((x) => check(x.id, `d${x.faces}: ${x.result} · ${x.source}`))
        .join(""),
  );
  if (!f) return;
  return request("reroll", actor, {
    messageId: message.id,
    revision: d.revision,
    aptitudeId: f.get("aptitude"),
    diceIds: d.results.filter((x) => f.has(x.id)).map((x) => x.id),
  });
}
