![Cartografía del Azul](assets/ea-github-hero.webp)

# Eterno Azul para Foundry VTT

[![Validación](https://github.com/ManuRomera/eterno-azul-foundry/actions/workflows/check.yml/badge.svg)](https://github.com/ManuRomera/eterno-azul-foundry/actions/workflows/check.yml)
[![Release](https://img.shields.io/github/v/release/ManuRomera/eterno-azul-foundry?include_prereleases)](https://github.com/ManuRomera/eterno-azul-foundry/releases)
![Foundry](https://img.shields.io/badge/Foundry-13.351%20%7C%2014%20pendiente-ceae71)
[![Código MIT](https://img.shields.io/badge/código-MIT-blue)](LICENSE)

Aventura, vínculos y navegación celeste con una interfaz de azul profundo, marfil y latón. Sistema nativo en castellano, sin Custom System Builder ni módulos obligatorios.

> **Versión candidata.** El sistema base se ha probado en Foundry 13.351. La capa de compatibilidad y las nuevas fichas requieren repetir QA real. Foundry v14 y la instalación limpia desde manifest todavía no están verificados. Consulta la [matriz de pruebas](docs/QA.md) antes de usarlo en una campaña.

## Vistas del sistema

Las fichas usan cabeceras propias para Buscador, PNJ y Surcazul, controles HTML, listas compactas y densidad configurable. La consola naval muestra instrumentos, distancia, rival, tripulación y armamento. Las capturas finales siguen pendientes por un bloqueo del navegador de pruebas; no se presentan mockups como capturas reales.

## Instalación

En **Game Systems → Install System → Manifest URL**, pega:

```text
https://raw.githubusercontent.com/ManuRomera/eterno-azul-foundry/main/system.json
```

La misma dirección y el mismo ZIP se utilizan para ambas generaciones. Descarga alternativa: [GitHub Releases](https://github.com/ManuRomera/eterno-azul-foundry/releases). Conserva una copia de seguridad de tu mundo antes de actualizar. Crea un mundo nuevo con **Eterno Azul para Foundry VTT** y entra como DJ.

## Buscadores

Diez Acciones con dado visible, Desafío al pulsar y reserva manual con Mayús. Señas, Vínculos, recursos y consecuencias en la vista de juego; inventario y magia en su propia sección. Origen y Arquetipo son Items estructurados que se editan desde la cabecera. Tamaño, pestaña, bloques y densidad se recuerdan por usuario y Actor.

## Desafíos y Bríos

Un solo motor construye reservas y resuelve éxitos, Riesgo y márgenes. Distingue Ventajas por fuente, copias de Acción, aumentos, reducciones y Bravata. Las tarjetas conservan resultados y revisiones en flags estructurados. Repetir sustituye los dados anteriores y consulta el recurso actual.

La DJ activa serializa las operaciones y comprueba permisos. Debe haber una DJ conectada para resolver solicitudes. Daño, Defensa, Heridas y descansos comparten el motor de recursos. Las decisiones narrativas permanecen en manos de la mesa.

## Vínculos

Arrastra un Actor a otro Buscador para crear el Vínculo. El aliado usa su propio Vínculo para ayudar al destinatario desde una tarjeta; suma un éxito y queda agotado. La recuperación requiere el momento narrativo correspondiente.

## Surcazules

Maniobra, Vela, Potencia, Bodega, Casco y Corazón; tripulación editable, baterías, munición y desperfectos. La consola enlaza el navío con su rival y el Buscador que actúa. Resuelve persecución y artillería sin convertir el navío en un personaje que tira por sí mismo.

## Herramientas de DJ y compendios

Ajustes → **Cartografía del Azul**: plantear Desafíos, preparar identidad, importar copias CSB y copiar un diagnóstico sin datos privados. El compendio incluido explica el software con texto propio. No incluye catálogos oficiales ni sustituye el manual del juego.

## Compatibilidad Foundry

Un repositorio, un sistema y una fuente de reglas. `module/compat/` detecta generación y capacidades y concentra los puntos de integración: APIs V2, DOM de hooks, privacidad de chat y formato de estados. ApplicationV2, ActorSheetV2 e ItemSheetV2 se mantienen en ambas generaciones. No hay implementaciones separadas v13/v14.

- **13.351:** sistema base probado; candidata actual pendiente de regresión real.
- **14:** contratos auditados, adaptadores implementados; todavía sin prueba en runtime real.
- **15 y posteriores:** fuera del alcance declarado.

[Decisiones y fuentes](docs/FOUNDRY-COMPATIBILITY.md) · [QA real](docs/QA.md).

## Migración desde CSB

El importador crea un Actor nuevo y conserva la exportación original localmente; no ejecuta fórmulas ni altera el mundo de origen. Revisa Aptitudes, vínculos e imágenes después de convertir. [Guía de migración](docs/MIGRATION-FROM-CSB.md).

## Pendiente antes de una versión final

Regresión real v13 del refactor, prueba completa v14, instalación limpia remota, Dice So Nice activado, pruebas de arrastre/teclado y galería completa. Las reglas completas de creación y magia requieren fuentes adicionales autorizadas; no se inventan automatizaciones.

## Desarrollo

Node.js 22 o superior: `npm ci`, `npm test`, `npm run check`, `npm run build`. `_data/` contiene las fuentes versionables; los packs LevelDB se generan. El ZIP incluye únicamente runtime y recursos, sin exportaciones privadas ni herramientas de desarrollo.

## Créditos y licencia

Proyecto no oficial de ManuRomera. Eterno Azul pertenece a sus titulares. Obtén las reglas en [Shadowlands](https://shadowlands.es/descargas/). No se redistribuyen PDFs, textos de reglas ni arte oficial.

Código y SVG propio bajo MIT. Cartografía del Azul es el paquete gráfico aportado por ManuRomera para este sistema; su integración no lo convierte en arte oficial ni amplía automáticamente la licencia MIT del código. [Inventario de recursos](docs/ASSET-MANIFEST.md).

Storypath Ultra y dnd5e se estudiaron como referencias técnicas, sin copiar su código, contenidos o identidad visual. [Auditoría de referencias](docs/REFERENCE-REVIEW.md).
