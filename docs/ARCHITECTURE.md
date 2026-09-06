# Arquitectura

Sistema independiente: ES modules, TypeDataModel, ActorSheetV2 e ItemSheetV2 con HandlebarsApplicationMixin. No depende de CSB. La compatibilidad se declara solo según pruebas registradas en QA.md.

## Capas
- rules/: funciones puras de reserva, éxitos, recursos, daño, descanso y navegación. No acceden a Foundry.
- data/: tres modelos de Actor y dieciséis modelos Item; composición de esquemas reutiliza recursos sin convertir los tipos en un objeto genérico.
- documents/operations: valida permisos y recursos actuales. Peticiones ChatMessage con autor autenticado de Foundry; la DJ activa las serializa y deja estado done/error. No usa sockets con userId declarado por el cliente.
- applications/: constructor de reserva, consola naval y herramientas de DJ.
- sheets/: presentación, formularios reactivos, actions V2, drag/drop nativo. Preferencias por mundo/usuario/Actor en almacenamiento local del navegador.
- chat/: tarjetas encapsuladas. Flags almacenan dados con identidad estable, resultados, márgenes, revisiones, vínculos e historial; no se interpreta HTML para resolver reglas.
- migrations/: convierte copias exportadas; no ejecuta fórmulas y conserva el original en flags locales.
- _data/: fuente JSON versionable de compendios. Build genera LevelDB; ZIP incluye únicamente allowlist de archivos de runtime.

## Concurrencia
Las operaciones de juego necesitan DJ conectada. Una cola global en esa sesión serializa solicitudes. La revisión del mensaje rechaza acciones obsoletas. Una desconexión de DJ durante una operación puede dejar solicitud pendiente: no se reejecuta automáticamente para evitar cobros dobles. El historial de mensajes permite revisión. Foundry no ofrece transacciones atómicas entre Actor, Item y ChatMessage: revisar recursos tras una desconexión durante escritura.

## UI
Clases ea-app/ea-chat-card, Grid/Flex, container queries a 440/650/1000px, densidad como variante. Arte únicamente decorativo con gradientes de contraste. Sin listeners por temporizador ni dependencias de imágenes para controles.
