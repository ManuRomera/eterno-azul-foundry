export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const label = (k) =>
  ({
    value: "Actual",
    max: "Máximo",
    description: "Descripción",
    source: "Fuente",
    quantity: "Cantidad",
    bulk: "Bulto",
    uses: "Usos",
    consumable: "Desaparece al agotarse",
    carried: "Transportado",
    equipped: "Equipado",
    tags: "Etiquetas",
    damage: "Daño",
    defense: "Defensa",
    effect: "Efecto",
    kind: "Automatización",
    actions: "Acciones (separadas por coma)",
    cost: "Coste en Brío",
    trigger: "Cuándo se aplica",
    citation: "Referencia de la regla",
    frequency: "Frecuencia",
    targets: "Objetivos",
    range: "Alcance",
    requirements: "Requisitos",
    duration: "Duración",
    intensity: "Intensidad",
    visibility: "Visibilidad en la interfaz",
    narrative: "Efecto narrativo",
    limitedUses: "Usos limitados por Intensidad",
    expiresAfterDuration: "Desaparece al terminar duración",
    active: "Activo",
    severity: "Gravedad",
    affectedActions: "Acciones afectadas (separadas por coma)",
    die: "Dado",
    archetype: "Seña de Arquetipo",
    targetUuid: "UUID del otro Actor",
    targetName: "Nombre del otro Actor",
    targetImg: "Imagen del otro Actor",
    exhausted: "Agotado",
    arc: "Posición de batería",
  })[k] ?? k;
export async function prompt(title, content) {
  return foundry.applications.api.DialogV2.prompt({
    window: { title },
    classes: ["ea-app"],
    content: `<div class="ea-dialog">${content}</div>`,
    ok: {
      label: "Continuar",
      callback: (event, button) => new FormData(button.form),
    },
    rejectClose: false,
  });
}
export function field(name, title, value = "", type = "text") {
  return `<label class="ea-field">${esc(title)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${type === "number" ? 'min="0" step="1"' : ""}></label>`;
}
export function select(name, title, options, value) {
  return `<label class="ea-field">${esc(title)}<select name="${esc(name)}">${options.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(value) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
}
export function check(name, title, on = false) {
  return `<label class="ea-check"><input name="${esc(name)}" type="checkbox" ${on ? "checked" : ""}>${esc(title)}</label>`;
}
