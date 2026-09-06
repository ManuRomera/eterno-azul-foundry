# Traer una ficha desde CSB

1. Exporta el Actor como JSON desde el mundo antiguo y conserva esa copia.
2. En un mundo Eterno Azul, entra como DJ y abre Ajustes → Cartografía del Azul → herramientas.
3. Elige **Importar Actor desde CSB**, selecciona el archivo y el tipo de ficha.
4. Revisa las advertencias antes de crear la copia. El Actor original nunca se modifica.
5. Comprueba dados, Bríos, salud, equipo, Aptitudes y vínculos antes de jugar. Enlaza los Actors nuevos y asigna imágenes propias.

El importador no ejecuta fórmulas CSB. Conserva el JSON original en flags locales para revisión. Esos flags pueden contener información de tu ficha: no se publican ni se envían al repositorio. Los observadores de un Actor pueden recibir sus datos completos; conserva secretos en Diarios con permisos privados.

Aptitudes y campos no automatizados permanecen como texto; añade efectos mecánicos solamente cuando correspondan a las reglas de tu manual. Señas y valores usan las propiedades reales de las plantillas auditadas. Las tablas particulares de otros mundos pueden necesitar ajuste manual.

## Identidad de Actors nativos anteriores

Origen y Arquetipo se almacenan como Items. Al entrar la DJ activa, la migración crea los Items necesarios, guarda sus IDs en `system.identity` y limpia los textos anteriores únicamente después de crear los documentos. Si la escritura se interrumpe, la próxima ejecución reconoce los Items existentes y evita duplicarlos. Si ya existe una identidad diferente, conserva ambos Items para revisión y respeta la relación explícita. La cabecera permite elegir y editar el Item activo.

Haz una copia de seguridad del mundo antes de actualizar. La migración automática se ha probado con documentos simulados; falta repetirla dentro de Foundry tras el refactor de identidad.
