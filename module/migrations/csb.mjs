import { ACTIONS, ID } from "../config.mjs";
const n = (v, fallback = 0) =>
  Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : fallback;
const plain = (v) => (typeof v === "string" ? v : String(v ?? ""));
export function convertItem(raw) {
  const p = raw.system?.props ?? {},
    type =
      { 1: "pertrecho", 2: "arma", 3: "armadura", 4: "bateria", 5: "municion" }[
        p.tipoequipo
      ] ?? "pertrecho";
  return {
    name: plain(raw.name) || "Pertrecho importado",
    type,
    img: "systems/eterno-azul/assets/compass.svg",
    system: {
      description: plain(p.etiquetasequipo),
      bulk: n(p.bultoequip, 1),
      quantity: type === "municion" ? n(p.cantmunic) : 1,
      uses: { value: n(p.usosequip), max: n(p.usosequip) },
      ...(type === "arma" ? { damage: n(p.danoarma) } : {}),
      ...(type === "armadura" ? { defense: n(p.defensaarma) } : {}),
      ...(type === "bateria" ? { damage: n(p.danobateria) } : {}),
    },
    flags: { [ID]: { legacy: { id: raw._id, props: structuredClone(p) } } },
  };
}
export function convertActor(raw, type = "buscador") {
  if (
    !raw ||
    !raw.system?.props ||
    !["buscador", "pnj", "surcazul"].includes(type)
  )
    throw new Error("No es una exportación de Actor CSB válida");
  const p = raw.system.props,
    warnings = [
      "Se crea una copia independiente. Revisa el resultado antes de jugar.",
      "Imágenes CSB no copiadas: asigna imágenes propias.",
      "Vínculos sin UUID: enlaza los nuevos Actors después de importar.",
    ];
  const actor = {
    name: plain(raw.name) || "Actor importado",
    type,
    img: "systems/eterno-azul/assets/compass.svg",
    system: { notes: plain(p.trasfo_copy1) },
    items: (raw.items ?? []).map(convertItem),
    flags: {
      [ID]: {
        migration: {
          version: 1,
          sourceSystem: "custom-system-builder",
          original: structuredClone(raw),
        },
      },
    },
  };
  if (type === "buscador") {
    Object.assign(actor.system, {
      origin: plain(p.origen),
      archetype: plain(p.arquetipo),
      brio: {
        value: Array.from(
          { length: 6 },
          (_, i) => p[`brio${i + 1}`] === true || p[`brio${i + 1}`] === "true",
        ).filter(Boolean).length,
        max: 6,
      },
      actions: Object.fromEntries(
        Object.keys(ACTIONS).map((k) => {
          const d = n(p[`${k}radio`], 6);
          return [k, [0, 4, 6, 8, 10, 12].includes(d) ? d : 6];
        }),
      ),
      stamina: n(p.aguanttot, 10),
      damage: n(p.aguanteact),
      defense: { value: n(p.defact), max: n(p.deftot, p.defact) },
      loot: n(p.botin),
      biography: plain(p.trasfo),
    });
    for (let i = 1; i <= 6; i++)
      if (p[`sena${i}`])
        actor.items.push({
          name: plain(p[`sena${i}`]),
          type: "sena",
          system: {
            die: [0, 4, 6, 8, 10, 12].includes(n(p[`sendaradio${i}`]))
              ? n(p[`sendaradio${i}`])
              : 8,
            archetype: i === 1,
          },
        });
    for (let i = 0; i < 5; i++) {
      const suffix = "_copy1".repeat(i);
      if (p[`vinc1${suffix}`])
        actor.items.push({
          name: plain(p[`vinc1${suffix}`]),
          type: "vinculo",
          system: {
            description: plain(p[`vinc1${suffix}`]),
            exhausted: Boolean(p[`senacheck1${"_copy1".repeat(i + 1)}`]),
          },
        });
    }
    for (const key of ["origenapt", "arquetipoapt"])
      if (p[key])
        actor.items.push({
          name:
            key === "origenapt" ? "Aptitud de Origen" : "Aptitud de Arquetipo",
          type: "aptitud",
          system: { description: plain(p[key]) },
        });
    for (const row of Object.values(p.aptother ?? {}))
      if (row && typeof row === "object" && !row.$deleted && row.apt)
        actor.items.push({
          name: "Aptitud importada",
          type: "aptitud",
          system: { description: plain(row.apt) },
        });
  }
  if (type === "pnj")
    Object.assign(actor.system, {
      threat: n(p.defact),
      stamina: n(p.aguanttot, 10),
      damage: n(p.aguanteact),
      traits: plain(p.origenapt),
      characteristicActions: plain(p.arquetipoapt),
      description: plain(p.arquetipoapt_copy1),
    });
  if (type === "surcazul")
    Object.assign(actor.system, {
      class: plain(p.origen),
      description: plain(p.trasfo),
      maneuver: n(p.maniobra),
      sail: n(p.maniobra_copy1),
      power: n(p.maniobra_copy1_copy1),
      hold: n(p.maniobra_copy1_copy1_copy1),
      hull: n(p.maniobra_copy1_copy1_copy1_copy1),
      damage: n(p.maniobra_copy1_copy1_copy1_copy1_copy1),
      heart: {
        max: n(p.maniobra_copy1_copy1_copy1_copy1_copy2),
        value: n(p.maniobra_copy1_copy1_copy1_copy1_copy1_copy1),
      },
      crew: Object.values(p.buscadorestable ?? {})
        .filter(
          (v) => v && typeof v === "object" && !v.$deleted && v.nombuscador,
        )
        .map((v) => ({
          name: plain(v.nombuscador),
          uuid: "",
          role: "",
          present: Boolean(v.presentecheck),
        })),
      cargo: plain(p.arquetipoapt),
      supplies: plain(p.arquetipoapt_copy1),
    });
  for (let i = 0; i < 3; i++) {
    const key = "sena5_copy1_copy1" + "_copy1".repeat(i);
    if (p[key])
      actor.items.push({
        name: plain(p[key]),
        type: type === "surcazul" ? "desperfecto" : "herida",
        system: { severity: n(p["gravher_copy1" + "_copy1".repeat(i)], 1) },
      });
  }
  warnings.push(
    "Aptitudes migradas como texto: confirma trigger, coste y automatización. Todas las propiedades no mapeadas se conservan en flags locales.",
  );
  return { actor, warnings };
}
