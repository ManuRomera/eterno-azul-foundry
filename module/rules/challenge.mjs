export const DICE = Object.freeze([4, 6, 8, 10, 12]);
export function integer(
  value,
  name = "valor",
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max)
    throw new Error(`${name}: valor inválido`);
  return n;
}
export function die(value) {
  const n = Number(value);
  if (!DICE.includes(n)) throw new Error("Dado no válido");
  return n;
}
export function buildPool({
  action = 6,
  sign = 6,
  copies = 1,
  advantages = [],
  shifts = [],
  manual = null,
} = {}) {
  let pool = manual
    ? manual.map((d, i) => ({ id: `d${i}`, faces: die(d), source: "manual" }))
    : [...Array(integer(copies, "copias", 1, 100))]
        .map((_, i) => ({ id: `a${i}`, faces: die(action), source: "Acción" }))
        .concat({ id: "s0", faces: die(sign), source: "Seña" });
  if (!pool.length || pool.length > 100)
    throw new Error("Reserva vacía o demasiado grande (límite técnico: 100)");
  let riskBonus = 0,
    overflow = 0;
  for (const shift of shifts) {
    if (![-1, 1].includes(shift.direction))
      throw new Error("Modificador inválido");
    const candidates = pool.filter(
      (d) => !shift.source || d.source === shift.source,
    );
    if (!candidates.length) throw new Error("No hay dado para modificar");
    const target = candidates.reduce((a, b) =>
      shift.direction > 0
        ? a.faces <= b.faces
          ? a
          : b
        : a.faces >= b.faces
          ? a
          : b,
    );
    const next = DICE.indexOf(target.faces) + shift.direction;
    if (next < 0) riskBonus++;
    else if (next >= DICE.length) overflow++;
    else target.faces = DICE[next];
  }
  const seen = new Set();
  for (const a of advantages) {
    if (!a.category || !a.label) throw new Error("Indica la fuente de Ventaja");
    if (seen.has(a.category) && !a.stackable)
      throw new Error(`Ventaja duplicada: ${a.category}`);
    seen.add(a.category);
    pool.push({ id: `v${pool.length}`, faces: 6, source: a.label });
  }
  for (let i = 0; i < overflow; i++)
    pool.push({ id: `o${i}`, faces: 6, source: "Aumento sobre d12" });
  if (pool.length > 100) throw new Error("Límite técnico de 100 dados");
  return {
    pool,
    riskBonus,
    formula: pool.map((d) => `1d${d.faces}`).join("+"),
  };
}
export function resolve(results, risk = 1, bond = 0) {
  integer(risk, "Riesgo");
  integer(bond, "Vínculos");
  let successes = bond;
  for (const d of results) {
    die(d.faces);
    integer(d.result, "resultado", 1, d.faces);
    successes += d.result >= 8 ? 2 : d.result >= 4 ? 1 : 0;
  }
  return {
    successes,
    risk,
    outcome:
      successes === 0
        ? "failure"
        : successes > risk
          ? "success"
          : "consequence",
    successMargin: Math.max(0, successes - risk),
    consequenceMargin: Math.max(0, risk - successes),
  };
}
export function replaceDice(previous, replacements) {
  const ids = new Set(previous.map((d) => d.id));
  if (
    replacements.some((d) => !ids.has(d.id)) ||
    new Set(replacements.map((d) => d.id)).size !== replacements.length
  )
    throw new Error("Selección inválida");
  return previous.map((d) => {
    const n = replacements.find((r) => r.id === d.id);
    if (n && n.faces !== d.faces)
      throw new Error("No se cambia tamaño al repetir");
    return n
      ? { ...d, result: integer(n.result, "resultado", 1, d.faces) }
      : { ...d };
  });
}
