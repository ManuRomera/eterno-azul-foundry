import test from "node:test";
import assert from "node:assert/strict";
import {
  identityPlan,
  identityItem,
  migrateIdentity,
} from "../module/migrations/identity.mjs";
test("Legacy identity plan preserves both text and existing structured identity", () => {
  const actor = {
    system: {
      origin: "Tidar",
      archetype: "Granuja",
      identity: { originId: "a" },
    },
    items: [{ id: "a", type: "origen", name: "Otro origen" }],
  };
  assert.equal(identityPlan(actor).length, 2);
  assert.equal(identityItem(actor, "origin").id, "a");
  assert.equal(actor.system.origin, "Tidar");
});
test("Identity migration is restartable and does not duplicate Items", async () => {
  const actor = {
    type: "buscador",
    system: { origin: "Tidar", archetype: "Granuja", identity: {} },
    items: [],
    async createEmbeddedDocuments(type, rows) {
      this.items.push(...rows.map((r, i) => ({ ...r, id: String(i) })));
    },
    async update(data) {
      for (const [k, v] of Object.entries(data)) {
        const parts = k.split(".");
        if (parts.length === 3) this.system.identity[parts[2]] = v;
        else this.system[parts[1]] = v;
      }
    },
  };
  await migrateIdentity(actor);
  assert.equal(actor.items.length, 2);
  assert.equal(actor.system.origin, "");
  assert.equal(identityItem(actor, "origin").name, "Tidar");
  await migrateIdentity(actor);
  assert.equal(actor.items.length, 2);
});
test("Partial migration resumes before clearing legacy data", () => {
  const actor = {
    system: { origin: "Tidar", identity: {} },
    items: [{ id: "x", name: "Tidar", type: "origen" }],
  };
  assert.deepEqual(identityPlan(actor), []);
  assert.equal(identityItem(actor, "origin").id, "x");
});
