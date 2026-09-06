import { integer } from "./challenge.mjs";
export function spend(value, cost = 1) {
  integer(value);
  integer(cost, "coste", 1);
  if (value < cost) throw new Error("Recurso insuficiente");
  return value - cost;
}
export function bulk(items) {
  return items.reduce((sum, { system: s }) => {
    if (
      s.bulk === undefined ||
      s.carried === false ||
      (s.consumable && s.uses?.value === 0)
    )
      return sum;
    const q = integer(s.quantity ?? 1);
    const b = Number(s.bulk);
    if (!Number.isFinite(b) || b < 0) throw new Error("Bulto inválido");
    return sum + b * q;
  }, 0);
}
export function damage({
  amount,
  accumulated = 0,
  threshold = 10,
  brio = false,
  defense = false,
  wound = false,
  wounds = 0,
}) {
  integer(amount, "daño");
  integer(accumulated);
  integer(threshold);
  integer(wounds);
  let applied = amount;
  if (brio) applied = Math.floor(applied / 2);
  if (defense) applied = Math.floor(applied / 2);
  const asWound = applied > 0 && (wound || accumulated > threshold);
  return {
    applied,
    accumulated: accumulated + (asWound ? 0 : applied),
    severity: asWound ? 1 + applied : 0,
    fatal: asWound && wounds >= 3,
    out: accumulated + (asWound ? 0 : applied) > threshold,
  };
}
export function recovery({ damage, brio, defenseMax, wounds = [] }, kind) {
  if (!["breather", "rest"].includes(kind))
    throw new Error("Descanso inválido");
  return {
    damage: kind === "rest" ? 0 : integer(damage) - Math.floor(damage / 2),
    brio: integer(brio) || 1,
    defense: integer(defenseMax),
    wounds: wounds
      .map((w) => ({
        ...w,
        severity: Math.max(0, w.severity - (kind === "rest" ? 1 : 0)),
      }))
      .filter((w) => w.severity > 0),
  };
}
export function assist(bond, targetUuid) {
  if (bond.exhausted || !bond.targetUuid || bond.targetUuid !== targetUuid)
    throw new Error("Vínculo no disponible para este Buscador");
  return { ...bond, exhausted: true };
}
export function resistCondition(intensity, successes) {
  integer(intensity);
  integer(successes);
  return {
    intensity: Math.max(0, intensity - successes),
    avoided: successes > intensity,
    expiresAfterDuration: successes === intensity,
  };
}
