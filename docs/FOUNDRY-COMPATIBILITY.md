# Compatibilidad Foundry

Un repositorio, un manifest y un ZIP. v13.351 es requisito mínimo. El perfil v14 está implementado con las APIs públicas documentadas, pero **no está verificado en una instalación v14**. Los tests de adaptadores en Node no sustituyen una prueba Foundry.

## Referencia investigada

[Storypath Ultra](https://foundryvtt.com/packages/storypath-ultra-fvtt), repositorio [jabelardo/storypath-ultra-fvtt](https://gitlab.com/jabelardo/storypath-ultra-fvtt), versión 1.10.7, commit `589e19d64cf85e881379e78d9c493f7cd43a7d76`, inspeccionado 2026-09-06. Implementación propia; no se copia código ni contenido.

`storypath-ultra.js` compara `isNewerVersion("14", game.version)` y transforma un catálogo de estados en Array u Object. Su hook de chat actual usa `querySelectorAll` sobre HTMLElement. `module/actor/actor.js` espera `super._preCreate`, respeta Items aportados y utiliza `updateSource` para los datos iniciales. No se encontró en ese método una bifurcación por generación: no se atribuye al proyecto una solución que el checkout no contiene. Su iniciativa usa `messageMode` y `applyMode`; no conviene trasladar esa llamada a v13 sin detección.

## Contratos y decisiones

| Problema | v13.351 | v14 | Solución Eterno Azul / archivos | Validación |
|---|---|---|---|---|
| Generación | game.release.generation | Mismo campo | compat/runtime.mjs, lectura diferida; fallback controlado game.version | Unitario: metadata, fallback, desconocida y futura |
| Hojas y diálogos | APIs V2 disponibles | APIs V2 disponibles | compat/applications.mjs, mismos símbolos públicos; sin V1 | QA anterior en v13; nueva integración pendiente |
| Hook de chat | renderChatMessageHTML ya entrega HTMLElement | HTMLElement | compat/hooks.mjs; acepta también wrapper legado sin depender de jQuery | Unitario DOM/wrapper/nulo |
| Estados | CONFIG.statusEffects Array | Object por id | compat/effects.mjs, detecta formato antes de generación | Unitario ambos formatos y no mutación |
| Modo chat | applyRollMode / rollMode | applyMode / messageMode | compat/chat.mjs, creación explícita user/whisper/blind comunes a ambas; no depende del modo activo del GM | Unitario cuatro modos; privacidad real v13 antes de extracción |
| Flags / revisión | getFlag, update | Mismos métodos públicos | Estado mecánico estructurado; no parsear HTML | QA v13 anterior: Brío, revisión y Vínculo |
| Actor.create | Datos iniciales + hook preCreateActor | Contrato público común | Hook updateSource, sin crear embedded docs durante preparación | Creación real v13 anterior; v14 pendiente |
| Item / embedded documents | create, createEmbeddedDocuments, update, deleteEmbeddedDocuments | Contrato público común | Sin wrappers vacíos ni overrides internos; se conservan llamadas públicas | Creación Items v13 anterior |
| fromUuid / permisos | UUID, OWNER/OBSERVER | Contrato público común | Resolución estándar y permisos actuales | QA de operaciones v13 anterior |
| ActiveEffect / Token / Combat | APIs core | APIs core | No overrides propios. Condiciones/heridas son Items, sin duplicarlas en estados token. Iniciativa narrativa | Revisión estática; interacción token/tracker pendiente |

El adaptador de estados está preparado para un catálogo justificado futuro; no se instala un catálogo ficticio ni se reemplazan estados core. Las reglas puras no importan compat ni globals Foundry. Solo compat lee la generación. Una versión futura no recibe automáticamente el perfil verificado.

## Diagnóstico

Ajustes → Cartografía del Azul → herramientas → Diagnóstico de compatibilidad → **Copiar diagnóstico**. Solo versión del sistema, versión/generación Foundry, perfil y disponibilidad de APIs. Sin nombres de mundo, usuarios, Actors, servidores, rutas, licencia ni credenciales. Si el navegador no permite portapapeles, el bloque sigue visible para selección manual. Arranque: una línea console.info.

## Fuentes primarias

- [ChatMessage v13](https://foundryvtt.com/api/v13/classes/foundry.documents.ChatMessage.html) y [v14](https://foundryvtt.com/api/v14/classes/foundry.documents.ChatMessage.html).
- [ChatMessageData v14](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.ChatMessageData.html): user, whisper y blind siguen siendo campos de creación.
- [Hook HTML v13](https://foundryvtt.com/api/v13/functions/hookEvents.renderChatMessageHTML.html) y [v14](https://foundryvtt.com/api/v14/functions/hookEvents.renderChatMessageHTML.html).
- [CONFIG.statusEffects v14](https://foundryvtt.com/api/v14/variables/CONFIG.statusEffects.html): el tipo declarado es Object, aunque la descripción todavía dice array.

## Límites verificables

No existe runtime v14 disponible localmente. Foundry exige instalación manual para cambiar de generación. Además, el navegador aislado quedó bloqueado por revisión automática al alcanzar el límite de uso. No se ha intentado eludir ese bloqueo. Por ello no se declara verified v14 y las modificaciones posteriores a la suite inicial requieren repetir QA real. Ver QA.md.
