# Estado del proyecto · 2026-09-06

Continuación sobre el repositorio existente. No hay release publicada todavía.

| Área | Estado |
|---|---|
| Foundry v13 compatibility | APIs V2 y funciones principales probadas en 13.351 antes del refactor compat |
| Foundry v14 compatibility | Contratos públicos auditados; runtime v14 no disponible; NO verificada |
| Compatibility layer | Implementada en module/compat; diagnóstico y normalización; 5 tests unitarios |
| UI refactor | Implementado: componentes por tipo, identidad Items, migración, contexto naval y edición de tripulación |
| QA v13 | Suite real anterior 18/18; hay que repetir tras nuevas modificaciones |
| QA v14 | Pendiente por falta de runtime |
| Release | Pendiente; download del manifest aún no existe |

## Completado
Auditoría CSB y reglas oficiales, motor puro, modelos especializados, hojas V2, operaciones con permisos, chat persistente, consola naval, importación local, compendio propio y assets Cartografía del Azul. Tests puros 13 + compatibilidad 5, validación estática correcta. Compatibilidad máxima declarada 14 y verified conservado en 13.351; idioma declarado solo español.

## Bloqueo real
La revisión automática bloqueó el navegador aislado por límite de uso después de ejecutar QA 18/18. No se puede completar más QA de interfaz ni obtener la galería final en esta sesión mientras siga bloqueado. La captura preliminar docs/screenshots/buscador.png tiene encuadre incorrecto: no usar como galería final. No hay instalación v14 disponible; la actualización de generación exige instalador manual. No declarar tests pendientes como aprobados.

## Próximos pasos
Componentes, migración e identidad implementados; tests de composición y migración añadidos. Preparar documentación y distribución. Repetir QA real v13 y v14; capturas y prueba de instalación limpia. Publicar solo con limitaciones explícitas si sigue sin ser posible completar QA.

## Contenido
Solo código/arte propio o aportado para este proyecto y documentación original. Los PDFs oficiales y los packs CSB de estudio quedan fuera de Git y del ZIP. Creación y magia completas requieren el manual básico; no inventar reglas.
