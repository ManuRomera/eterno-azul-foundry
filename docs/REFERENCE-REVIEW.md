# Referencias de ingeniería

Inspección directa de checkouts públicos el 2026-09-05.

- Cuervos de Asgard: _data/ separado, importador con marcas de versión, manual y workflow release. Se adopta fuente legible y manifest fijo. El importador contiene listas de contenido retirado por reglas inventadas: evitamos ese ciclo exigiendo fuente para automatizaciones. Workflow usa exclusiones generales y solo jq: sustituir por allowlist, test, validación de assets y comparación tag-versión también en dispatch.
- FrontierScum-ES-: ActorSheet V1, slots fijos e importadores específicos. Mantener claridad de inventario, abandonar slots duplicados como almacenamiento. ZIP y HTML auxiliar en raíz no serán parte de distribución.
- standee-portrait: preferencias en flags y configuración por Actor útiles; offsets y temporizadores de DOM no trasladados a hojas. Retrato decorativo independiente del contenido.
- ysystem3-srd: motor dice separado con helpers puros, flags de chat y contenido modular. Mejorar responsabilidad de permisos y operaciones repetidas; no usar evaluate({async:true}) obsoleto.
- dnd5e 6.0.x, ddbcc7dc486fbc6fe4e3bd9b2c7db1c57c95c278: manifest 6.0.0 mínimo 14.367. Inspeccionados base-actor-sheet, character-sheet y mixins V2: contexto por partes, actions, preferences usuario, drag/drop nativo y hojas con componentes. Se adoptan principios y APIs; implementación y SVG originales, sin branding/código copiado.
- Custom System Builder: RadioButton.ts confirma que group es la propiedad persistida. La key del componente no es una ruta fiable de migración.
