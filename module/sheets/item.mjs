import { TYPES, ACTIONS } from "../config.mjs";
import { esc, label, select } from "../utils/ui.mjs";
const { HandlebarsApplicationMixin } = foundry.applications.api;
function controls(value, path = "system") {
  return Object.entries(value)
    .map(([k, v]) => {
      const name = `${path}.${k}`,
        title = label(k);
      if (v && typeof v === "object" && !Array.isArray(v))
        return `<fieldset><legend>${esc(title)}</legend>${controls(v, name)}</fieldset>`;
      if (typeof v === "boolean")
        return `<label class="ea-check"><input type="checkbox" name="${name}" ${v ? "checked" : ""}>${esc(title)}</label>`;
      const choices = {
        kind: [
          ["none", "Solo descripción"],
          ["copyAction", "Añadir una copia del dado de Acción"],
          ["advantage", "Añadir Ventaja"],
          ["increase", "Aumentar dado menor"],
          ["decrease", "Reducir dado mayor"],
          ["rerollOnes", "Repetir resultados de 1"],
          ["selectiveBrio", "Brío: repetir dados elegidos"],
          ["narrative", "Efecto narrativo"],
        ],
        visibility: [
          ["public", "Visible"],
          ["gm", "Ocultar en lista de jugadores"],
        ],
        arc: [
          ["broadside", "Babor / estribor"],
          ["bow", "Proa"],
          ["stern", "Popa"],
        ],
        die: [
          [0, "Sin dado"],
          [4, "d4"],
          [6, "d6"],
          [8, "d8"],
          [10, "d10"],
          [12, "d12"],
        ],
      };
      if (choices[k]) return select(name, title, choices[k], v);
      if (Array.isArray(v))
        return `<fieldset><legend>${esc(title.replace(" (separadas por coma)", ""))}</legend>${Object.entries(
          ACTIONS,
        )
          .map(
            ([id, n]) =>
              `<label class="ea-check"><input type="checkbox" data-ea-action-list="${name}" value="${id}" ${v.includes(id) ? "checked" : ""}>${n}</label>`,
          )
          .join("")}</fieldset>`;
      return `<label>${esc(title)}${["description", "narrative", "trigger", "requirements"].includes(k) ? `<textarea name="${name}">${esc(v)}</textarea>` : `<input name="${name}" type="${typeof v === "number" ? "number" : "text"}" ${typeof v === "number" ? 'min="0" step="0.5"' : ""} value="${esc(v)}">`}</label>`;
    })
    .join("");
}
export class EAItemSheet extends HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2,
) {
  static DEFAULT_OPTIONS = {
    classes: ["ea-app", "ea-item"],
    position: { width: 520, height: 650 },
    window: { resizable: true },
    form: { submitOnChange: true },
  };
  static PARTS = {
    body: {
      template: "systems/eterno-azul/templates/items/item.hbs",
      scrollable: [""],
    },
  };
  async _prepareContext(o) {
    return {
      ...(await super._prepareContext(o)),
      name: this.item.name,
      img: this.item.img,
      type: TYPES[this.item.type],
      controls: controls(this.item.system.toObject()),
    };
  }
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    const paths = new Set(
      [...form.querySelectorAll("[data-ea-action-list]")].map(
        (i) => i.dataset.eaActionList,
      ),
    );
    for (const path of paths) {
      delete data[path];
      foundry.utils.setProperty(
        data,
        path,
        [...form.querySelectorAll("[data-ea-action-list]")]
          .filter((i) => i.dataset.eaActionList === path && i.checked)
          .map((i) => i.value),
      );
    }
    return data;
  }
}
