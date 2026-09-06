const types = { origin: "origen", archetype: "arquetipo" };
/** Pure plan, idempotent even after a partial write; never overwrites an existing Item. */
export function identityPlan(actor) {
  const create = [];
  for (const [key, type] of Object.entries(types)) {
    const name = actor.system?.[key]?.trim();
    if (name && !actor.items.some((i) => i.type === type && i.name === name))
      create.push({
        name,
        type,
        system: { source: "Identidad del Actor anterior" },
        flags: { "eterno-azul": { legacyIdentity: key } },
      });
  }
  return create;
}
export function identityItem(actor, key) {
  const type = types[key],
    id = actor.system?.identity?.[`${key}Id`];
  return (
    actor.items.find((i) => i.id === id && i.type === type) ??
    actor.items.find(
      (i) => i.type === type && i.name === actor.system?.[key],
    ) ??
    actor.items.find((i) => i.type === type) ??
    null
  );
}
export async function migrateIdentity(actor) {
  if (actor.type !== "buscador") return;
  const create = identityPlan(actor);
  if (create.length) await actor.createEmbeddedDocuments("Item", create);
  const update = {};
  for (const key of Object.keys(types)) {
    const item = identityItem(actor, key);
    if (item && actor.system.identity?.[`${key}Id`] !== item.id)
      update[`system.identity.${key}Id`] = item.id;
    if (actor.system[key]) update[`system.${key}`] = "";
  }
  if (Object.keys(update).length) await actor.update(update);
}
export async function migrateWorldIdentities() {
  if (game.users.activeGM?.id !== game.user.id) return;
  for (const actor of game.actors) await migrateIdentity(actor);
}
