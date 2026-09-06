import { integer } from "./challenge.mjs";
export function compareNaval(own, enemies, { maneuver = false } = {}) {
  integer(own);
  if (!enemies.length) throw new Error("Falta navío rival");
  enemies.forEach((v) => integer(v));
  return Math.sign(
    own - (Math.max(...enemies) + (maneuver ? enemies.length - 1 : 0)),
  );
}
export function navalDamage(
  power,
  margin,
  distance,
  arc = "broadside",
  successes = 1,
) {
  integer(power);
  integer(margin);
  integer(distance, "distancia", 0, 4);
  if (!["broadside", "bow", "stern"].includes(arc))
    throw new Error("Batería inválida");
  if (distance >= 3) throw new Error("Fuera del alcance de fuego");
  if (!successes) return 0;
  const amount = (arc === "broadside" ? power : Math.floor(power / 2)) + margin;
  return distance === 2 ? Math.floor(amount / 2) : amount;
}
export function pursuit({
  distance,
  successes,
  risk,
  pursuer = true,
  consequence = false,
  moored = false,
}) {
  integer(distance, "distancia", 0, 4);
  integer(successes);
  integer(risk);
  if (moored) throw new Error("Debes cortar los amarres antes de huir");
  if (distance === 4) throw new Error("La persecución ha terminado");
  let benefit =
    successes === 0
      ? consequence
        ? 0
        : -1
      : successes <= risk
        ? consequence
          ? 1
          : 0
        : consequence
          ? 2
          : 1;
  return Math.max(0, Math.min(4, distance + benefit * (pursuer ? -1 : 1)));
}
