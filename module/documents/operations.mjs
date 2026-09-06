import { createMessage, rollPrivacy } from "../compat/chat.mjs";
import { ID, ACTIONS } from "../config.mjs";
import {
  buildPool,
  resolve,
  replaceDice,
  integer,
} from "../rules/challenge.mjs";
import { spend, damage, recovery, assist } from "../rules/resources.mjs";
import { card } from "../chat/cards.mjs";
import { esc } from "../utils/ui.mjs";
let queue = Promise.resolve();
export function serial(task) {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
}
function own(actor, user) {
  if (!actor?.testUserPermission(user, "OWNER"))
    throw new Error("Necesitas permiso de propietario sobre este Actor");
}
export async function request(operation, actor, payload = {}) {
  own(actor, game.user);
  if (!game.users.activeGM)
    throw new Error(
      "Conecta una DJ para resolver operaciones compartidas con seguridad",
    );
  return createMessage({
    content: `<div class="ea-chat-card">Solicitud: ${esc(operation)} · ${esc(actor.name)}</div>`,
    whisper: [
      ...new Set([
        game.user.id,
        ...game.users.filter((u) => u.isGM).map((u) => u.id),
      ]),
    ],
    flags: {
      [ID]: {
        request: {
          operation,
          actorUuid: actor.uuid,
          payload,
          status: "pending",
        },
      },
    },
  });
}
export function setupAuthority() {
  Hooks.on("createChatMessage", (message) => {
    if (
      game.users.activeGM?.id !== game.user.id ||
      !message.getFlag(ID, "request")
    )
      return;
    serial(async () => {
      const command = message.getFlag(ID, "request");
      if (command.status !== "pending") return;
      try {
        await execute(command, message.author);
        await message.update({
          [`flags.${ID}.request.status`]: "done",
          content: '<div class="ea-chat-card">✓ Operación completada</div>',
        });
      } catch (e) {
        console.error("Eterno Azul", e);
        await message.update({
          [`flags.${ID}.request.status`]: "error",
          content: `<div class="ea-chat-card">${esc(e.message)}</div>`,
        });
      }
    });
  });
}
async function evaluate(pool) {
  const roll = await new Roll(
    pool.map((d) => `1d${d.faces}`).join("+"),
  ).evaluate();
  const results = roll.dice.flatMap((d) =>
    d.results.filter((r) => r.active !== false).map((r) => r.result),
  );
  return { roll, results: pool.map((d, i) => ({ ...d, result: results[i] })) };
}
async function updateCard(message, data, roll) {
  const update = { content: card(data), [`flags.${ID}.challenge`]: data };
  if (roll) update.rolls = [roll];
  await message.update(update);
}
export async function execute({ operation, actorUuid, payload: p }, user) {
  const actor = await fromUuid(actorUuid);
  own(actor, user);
  const s = actor.system;
  if (operation === "roll") {
    if (actor.type !== "buscador")
      throw new Error("Solo los Buscadores tiran Desafíos");
    if (!ACTIONS[p.action]) throw new Error("Acción desconocida");
    const sign = p.signId ? actor.items.get(p.signId) : null;
    if (p.signId && sign?.type !== "sena") throw new Error("Seña no válida");
    const advantages = p.advantages ?? [],
      shifts = p.shifts ?? [];
    let copies = integer(p.copies ?? 1, "copias", 1, 100),
      cost = 0;
    const applied = [];
    for (const id of new Set(p.effects ?? [])) {
      const item = actor.items.get(id),
        e = item?.system.effect;
      if (
        !e ||
        e.kind === "none" ||
        !e.citation ||
        item.system.active === false
      )
        throw new Error("Efecto sin regla documentada");
      if (e.actions.length && !e.actions.includes(p.action))
        throw new Error("Aptitud no aplicable a esta Acción");
      if (e.kind === "copyAction") copies++;
      if (e.kind === "advantage")
        advantages.push({
          category: item.type === "condicion" ? "condition" : "aptitude",
          label: item.name,
        });
      if (["increase", "decrease"].includes(e.kind))
        shifts.push({ direction: e.kind === "increase" ? 1 : -1 });
      cost += e.cost;
      applied.push(item.name);
    }
    for (const id of new Set(p.wounds ?? [])) {
      const wound = actor.items.get(id);
      if (
        !["herida", "desperfecto"].includes(wound?.type) ||
        !wound.system.active
      )
        throw new Error("Herida no válida");
      shifts.push({ direction: -1 });
    }
    if (p.bravata) advantages.push({ category: "bravata", label: "Bravata" });
    const built = buildPool({
      action: s.actions[p.action],
      sign: sign?.system.die ?? 6,
      copies,
      advantages,
      shifts,
      manual: p.manual,
    });
    const risk = integer(p.risk, "Riesgo") + built.riskBonus;
    const rolled = p.forced
      ? { results: [], roll: null }
      : await evaluate(built.pool);
    const data = {
      actorUuid: actor.uuid,
      actorName: actor.name,
      action: p.action,
      signName: sign?.name ?? "Sin Seña · d6",
      context: p.context ?? "",
      bravata: p.bravata ?? "",
      applied,
      results: rolled.results,
      pool: built.pool,
      ...resolve(rolled.results, risk),
      risk,
      bondBonus: 0,
      bonds: [],
      revision: 0,
      forced: Boolean(p.forced),
      history: [],
    };
    if (cost && !p.forced)
      await actor.update({ "system.brio.value": spend(s.brio.value, cost) });
    if (p.forced) await actor.update({ "system.brio.value": s.brio.value + 1 });
    const mode = ["publicroll", "gmroll", "blindroll", "selfroll"].includes(
      p.rollMode,
    )
      ? p.rollMode
      : "publicroll";
    const chat = {
      speaker: ChatMessage.getSpeaker({ actor }),
      content: card(data),
      flags: { [ID]: { challenge: data } },
      rolls: rolled.roll ? [rolled.roll] : [],
    };
    Object.assign(
      chat,
      rollPrivacy(
        mode,
        user.id,
        game.users.filter((u) => u.isGM).map((u) => u.id),
      ),
    );
    // Roll documents are attached to the message; Dice So Nice handles them when present.
    return createMessage(chat);
  }
  if (operation === "reroll") {
    const message = game.messages.get(p.messageId),
      d = message?.getFlag(ID, "challenge");
    if (!d || d.actorUuid !== actor.uuid) throw new Error("Desafío no válido");
    if (d.forced)
      throw new Error("No hay tirada que repetir tras aceptar el fallo");
    if (d.revision !== p.revision)
      throw new Error("La tirada ha cambiado; revisa la tarjeta");
    let selected = d.results,
      cost = 1;
    if (p.aptitudeId) {
      const item = actor.items.get(p.aptitudeId),
        e = item?.system.effect;
      if (
        !e?.citation ||
        !["rerollOnes", "selectiveBrio"].includes(e.kind) ||
        (e.actions.length && !e.actions.includes(d.action))
      )
        throw new Error("Aptitud de repetición no aplicable");
      selected = d.results.filter((x) => p.diceIds?.includes(x.id));
      if (e.kind === "rerollOnes" && selected.some((x) => x.result !== 1))
        throw new Error("Solo puedes repetir resultados de 1");
      cost = e.kind === "selectiveBrio" ? Math.max(1, e.cost) : e.cost;
    }
    if (!selected.length) throw new Error("Selecciona al menos un dado");
    if (cost) spend(s.brio.value, cost);
    const rolled = await evaluate(selected);
    const results = replaceDice(d.results, rolled.results);
    const data = {
      ...d,
      results,
      ...resolve(results, d.risk, d.bondBonus),
      revision: d.revision + 1,
      history: [
        ...(d.history ?? []),
        {
          results: d.results,
          revision: d.revision,
          reason: p.aptitudeId ? "aptitude" : "brio",
        },
      ],
    };
    if (cost)
      await actor.update({ "system.brio.value": spend(s.brio.value, cost) });
    await updateCard(message, data, rolled.roll);
    return;
  }
  if (operation === "assist") {
    const message = game.messages.get(p.messageId),
      d = message?.getFlag(ID, "challenge");
    if (!d) throw new Error("Desafío no válido");
    const bond = actor.items.get(p.bondId);
    if (bond?.type !== "vinculo" || d.actorUuid === actor.uuid)
      throw new Error("El Vínculo ayuda a otro Buscador");
    if (d.forced)
      throw new Error("No puede evitarse un fallo voluntario con un Vínculo");
    assist(bond.system, d.actorUuid);
    await bond.update({ "system.exhausted": true });
    const data = {
      ...d,
      bondBonus: d.bondBonus + 1,
      bonds: [
        ...d.bonds,
        { uuid: bond.uuid, name: bond.name, actor: actor.uuid },
      ],
      ...resolve(d.results, d.risk, d.bondBonus + 1),
      revision: d.revision + 1,
    };
    await updateCard(message, data);
    return;
  }
  if (operation === "damage") {
    const wounds = actor.items.filter(
      (i) => ["herida", "desperfecto"].includes(i.type) && i.system.active,
    );
    if (p.brio) spend(s.brio?.value ?? 0);
    if (p.defense) spend(s.defense?.value ?? 0);
    const result = damage({
      amount: p.amount,
      accumulated: s.damage,
      threshold: s.stamina ?? s.hull,
      brio: p.brio,
      defense: p.defense,
      wound: p.wound,
      wounds: wounds.length,
    });
    if (result.fatal && !p.acceptFatal)
      throw new Error(
        "Cuarta Herida/Desperfecto: confirma la consecuencia terminal con la DJ",
      );
    const update = { "system.damage": result.accumulated };
    if (p.brio) update["system.brio.value"] = spend(s.brio.value);
    if (p.defense) update["system.defense.value"] = spend(s.defense.value);
    if (result.severity)
      await actor.createEmbeddedDocuments("Item", [
        {
          name: p.name || "Daño por describir",
          type: actor.type === "surcazul" ? "desperfecto" : "herida",
          system: { severity: result.severity, source: "Guía p.19 / p.21" },
        },
      ]);
    await actor.update(update);
    return;
  }
  if (operation === "rest") {
    if (actor.type !== "buscador")
      throw new Error("Este descanso solo corresponde a Buscadores");
    const now = game.time.worldTime;
    if (p.kind === "rest" && s.lastRest && now - s.lastRest < 86400)
      throw new Error("Solo un descanso por cada 24 horas de juego");
    const wounds = actor.items
      .filter((i) => i.type === "herida")
      .map((i) => ({ id: i.id, severity: i.system.severity }));
    const result = recovery(
      {
        damage: s.damage,
        brio: s.brio.value,
        defenseMax: s.defense.max,
        wounds,
      },
      p.kind,
    );
    await actor.update({
      "system.damage": result.damage,
      "system.brio.value": result.brio,
      "system.defense.value": result.defense,
      ...(p.kind === "rest" ? { "system.lastRest": now || 1 } : {}),
    });
    if (p.kind === "rest") {
      await actor.updateEmbeddedDocuments(
        "Item",
        result.wounds.map((w) => ({
          _id: w.id,
          "system.severity": w.severity,
        })),
      );
      const healed = wounds.filter(
        (w) => !result.wounds.some((n) => n.id === w.id),
      );
      if (healed.length)
        await actor.deleteEmbeddedDocuments(
          "Item",
          healed.map((w) => w.id),
        );
    }
    return;
  }
  if (operation === "brio") {
    if (!["narrative", "consequence", "aptitude"].includes(p.use))
      throw new Error("Uso no válido");
    let cost = 1;
    if (p.use === "aptitude") {
      const item = actor.items.get(p.itemId);
      if (!item?.system.effect?.citation)
        throw new Error("Selecciona una Aptitud documentada");
      cost = integer(item.system.effect.cost, "coste", 1);
    }
    await actor.update({ "system.brio.value": spend(s.brio.value, cost) });
    return;
  }
  throw new Error("Operación desconocida");
}
