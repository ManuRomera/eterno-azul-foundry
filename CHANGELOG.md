# Changelog

## [0.1.0-rc.1] - 2026-09-06

Primera candidata pública; no es una versión final verificada en ambas generaciones.

- Sistema nativo con tres tipos Actor y dieciséis Items, sin CSB.
- Motor puro de Desafíos, Bríos, Vínculos, daño, descanso y navegación.
- Capa de compatibilidad v13/v14: capacidades, APIs V2, DOM normalizado, privacidad y diagnóstico sin datos privados.
- Buscador, PNJ y Surcazul con composiciones propias; identidad estructurada con migración recuperable.
- Cartografía del Azul: cabeceras, medallones, superficie discreta y consola naval. Densidad y preferencias por usuario.
- Edición de tripulación y resumen naval con rival, distancia y armamento.
- Idioma declarado únicamente español; importador local CSB y compendio propio.
- 23 tests unitarios/composición, validación estática, packs generados y ZIP por allowlist.

**QA:** 18/18 comprobaciones reales sobre la base anterior en Foundry 13.351. El refactor actual requiere regresión real. Foundry v14, Dice So Nice activado, galería final e instalación limpia desde manifest siguen pendientes. El navegador de pruebas quedó bloqueado por límite de uso y no se dispone de runtime v14. No se declara verified v14.
