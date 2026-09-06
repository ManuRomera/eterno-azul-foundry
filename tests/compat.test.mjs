import test from "node:test";
import assert from "node:assert/strict";
import {
  versionInfo,
  capabilities,
  diagnostic,
} from "../module/compat/runtime.mjs";
import { normalizeHookElement } from "../module/compat/hooks.mjs";
import { statusEffectsData } from "../module/compat/effects.mjs";
import { rollPrivacy } from "../module/compat/chat.mjs";
test("Generation uses release metadata, controlled fallback and unsupported profile", () => {
  assert.equal(
    versionInfo({ release: { generation: 14 }, version: "13.351" }).generation,
    14,
  );
  assert.equal(versionInfo({ version: "13.351" }).profile, "v13");
  assert.equal(versionInfo({ version: "not-a-version" }).generation, null);
  assert.equal(
    versionInfo({ release: { generation: 15 } }).profile,
    "unsupported",
  );
});
test("Capabilities inspect APIs rather than a claimed version", () => {
  const env = {
    game: { release: { generation: 14 } },
    ChatMessage: { applyRollMode() {} },
    CONFIG: { statusEffects: [] },
  };
  assert.equal(capabilities(env).chatAPI, "applyRollMode");
  assert.equal(capabilities(env).applicationV2, false);
  assert.equal(capabilities(env).statusEffectsFormat, "array");
  assert.equal(diagnostic(env).foundry.profile, "v14");
});
test("Native and wrapped DOM elements converge; invalid values are ignored", () => {
  const element = { nodeType: 1, querySelector() {} };
  assert.equal(normalizeHookElement(element), element);
  assert.equal(normalizeHookElement({ 0: element }), element);
  for (const v of [null, undefined, {}, "html"])
    assert.equal(normalizeHookElement(v), null);
});
test("One catalogue can use both status contracts without mutation", () => {
  const source = [{ id: "test-only", name: "Fixture" }];
  const array = statusEffectsData(source, { CONFIG: { statusEffects: [] } });
  const object = statusEffectsData(source, { CONFIG: { statusEffects: {} } });
  assert.deepEqual(array, source);
  assert.deepEqual(object, { "test-only": source[0] });
  assert.notEqual(array[0], source[0]);
  assert.deepEqual(Object.keys(source), ["0"]);
  assert.throws(() => statusEffectsData([...source, ...source], {}));
});
test("Roll privacy preserves the requesting author across all four modes", () => {
  assert.deepEqual(rollPrivacy("selfroll", "player", ["gm"]).whisper, [
    "player",
  ]);
  assert.deepEqual(rollPrivacy("gmroll", "player", ["gm"]).whisper, [
    "gm",
    "player",
  ]);
  assert.deepEqual(rollPrivacy("blindroll", "player", ["gm"]), {
    user: "player",
    blind: true,
    whisper: ["gm"],
  });
  assert.deepEqual(rollPrivacy("publicroll", "player", ["gm"]).whisper, []);
  assert.throws(() => rollPrivacy("unknown", "player", []));
});
