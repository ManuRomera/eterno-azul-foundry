import { ACTIONS } from "../config.mjs";
import { bulk } from "../rules/resources.mjs";
const {
  StringField: S,
  NumberField: N,
  BooleanField: B,
  SchemaField: O,
  ArrayField: A,
} = foundry.data.fields;
const text = (initial = "") => new S({ required: true, blank: true, initial });
const number = (initial = 0, extra = {}) =>
  new N({ required: true, nullable: false, initial, min: 0, ...extra });
const bool = (initial = false) => new B({ initial });
const resource = (value = 0, max = value) =>
  new O({
    value: number(value, { integer: true }),
    max: number(max, { integer: true }),
  });
const choice = (values, initial) =>
  new S({ required: true, choices: values, initial });
const base = () => ({ description: text(), source: text() });
const effect = () =>
  new O({
    kind: choice(
      [
        "none",
        "copyAction",
        "advantage",
        "increase",
        "decrease",
        "rerollOnes",
        "selectiveBrio",
        "fixedSuccesses",
        "narrative",
      ],
      "none",
    ),
    actions: new A(new S({ choices: Object.keys(ACTIONS) })),
    cost: number(0, { integer: true }),
    value: number(),
    trigger: text(),
    citation: text(),
  });
export class BuscadorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Legacy text retained only to read old Actors; migration clears it.
      identity: new O({ originId: text(), archetypeId: text() }),
      origin: text(),
      archetype: text(),
      brio: resource(3, 6),
      defense: resource(),
      stamina: number(10, { integer: true }),
      damage: number(0, { integer: true }),
      actions: new O(
        Object.fromEntries(
          Object.keys(ACTIONS).map((k) => [
            k,
            number(6, { choices: [0, 4, 6, 8, 10, 12] }),
          ]),
        ),
      ),
      loot: number(),
      kit: resource(5),
      biography: text(),
      background: text(),
      notes: text(),
      shipUuid: text(),
      lastRest: number(),
      schemaVersion: number(1),
    };
  }
  prepareDerivedData() {
    this.bulk = bulk(this.parent?.items ?? []);
    this.out = this.damage > this.stamina;
  }
}
export class NPCData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      threat: number(1, { integer: true }),
      stamina: number(10, { integer: true }),
      damage: number(0, { integer: true }),
      traits: text(),
      characteristicActions: text(),
      attacks: text(),
      description: text(),
      notes: text(),
      schemaVersion: number(1),
    };
  }
  prepareDerivedData() {
    this.out = this.damage > this.stamina;
  }
}
export class ShipData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      class: text(),
      maneuver: number(),
      sail: number(),
      power: number(),
      hold: number(),
      hull: number(),
      heart: resource(),
      damage: number(),
      crew: new A(
        new O({
          uuid: text(),
          name: text(),
          role: text(),
          present: bool(true),
        }),
      ),
      cargo: text(),
      supplies: text(),
      passengers: text(),
      notes: text(),
      description: text(),
      state: text(),
      naval: new O({
        opponentUuid: text(),
        distance: number(3, { integer: true, max: 4 }),
        pursuer: bool(true),
        moored: bool(),
        context: text(),
      }),
      schemaVersion: number(1),
    };
  }
  prepareDerivedData() {
    this.out = this.damage > this.hull;
    this.bulk = bulk(this.parent?.items ?? []);
  }
}
class FeatureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return { ...base(), effect: effect() };
  }
}
export class OriginData extends FeatureData {}
export class ArchetypeData extends FeatureData {}
export class AptitudeData extends FeatureData {
  static defineSchema() {
    return { ...super.defineSchema(), uses: resource(), frequency: text() };
  }
}
export class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      quantity: number(1, { integer: true }),
      bulk: number(1, { step: 0.5 }),
      uses: resource(),
      consumable: bool(),
      carried: bool(true),
      equipped: bool(),
      tags: text(),
    };
  }
}
export class WeaponData extends GearData {
  static defineSchema() {
    return { ...super.defineSchema(), damage: number(), effect: effect() };
  }
}
export class ArmorData extends GearData {
  static defineSchema() {
    return { ...super.defineSchema(), defense: number(), effect: effect() };
  }
}
export class AmmoData extends GearData {}
export class BatteryData extends GearData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      arc: choice(["broadside", "bow", "stern"], "broadside"),
      damage: number(),
    };
  }
}
export class VerbData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      uses: resource(),
      targets: text(),
      range: text(),
      effect: effect(),
    };
  }
}
export class RitualData extends VerbData {
  static defineSchema() {
    return { ...super.defineSchema(), requirements: text(), duration: text() };
  }
}
export class UpgradeData extends FeatureData {}
export class ConditionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      intensity: number(1, { integer: true }),
      duration: text(),
      visibility: choice(["public", "gm"], "public"),
      narrative: text(),
      effect: effect(),
      limitedUses: bool(),
      expiresAfterDuration: bool(),
      active: bool(true),
    };
  }
}
export class WoundData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      severity: number(1, { integer: true }),
      affectedActions: new A(new S({ choices: Object.keys(ACTIONS) })),
      active: bool(true),
    };
  }
}
export class DamageData extends WoundData {}
export class SignData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      die: number(8, { choices: [0, 4, 6, 8, 10, 12] }),
      archetype: bool(),
    };
  }
}
export class BondData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      targetUuid: text(),
      targetName: text(),
      targetImg: text(),
      exhausted: bool(),
    };
  }
}
export const actorModels = {
  buscador: BuscadorData,
  pnj: NPCData,
  surcazul: ShipData,
};
export const itemModels = {
  origen: OriginData,
  arquetipo: ArchetypeData,
  aptitud: AptitudeData,
  pertrecho: GearData,
  arma: WeaponData,
  armadura: ArmorData,
  verbo: VerbData,
  ritual: RitualData,
  bateria: BatteryData,
  municion: AmmoData,
  mejora: UpgradeData,
  condicion: ConditionData,
  herida: WoundData,
  desperfecto: DamageData,
  sena: SignData,
  vinculo: BondData,
};
