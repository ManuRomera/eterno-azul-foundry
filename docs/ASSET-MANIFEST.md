# ASSET_MANIFEST — Cartografía del Azul

Paquete gráfico original para el sistema nativo de **Eterno Azul** en Foundry VTT. La colección toma como referencia visual interna `ea-github-hero.webp`: azul profundo, marfil, latón envejecido y luminaria cian; realismo fantástico elegante con ornamentación cartográfica contenida.

| Filename | Dimensiones | Formato | Función | Transparencia | Recomendaciones de uso / recorte |
|---|---:|---|---|---|---|
| `ea-github-hero.webp` | 2048×640 | WebP | Hero de README/GitHub | No | Mantener el navío a la izquierda. El tercio derecho está suavemente oscurecido para permitir composición editorial externa. No incrustar texto dentro del asset. |
| `ea-system-background.webp` | 1920×1080 | WebP | Fondo de selección del sistema / escenas UI | No | Puede usarse `cover`; el centro se ha calmado deliberadamente para ventanas y controles. |
| `ea-system-icon.png` | 1024×1024 | PNG | Icono del sistema | Sí | Símbolo pensado para reducirse. Para 48–64 px conviene generar una versión simplificada futura en SVG/WebP. |
| `ea-buscador-header.webp` | 1600×480 | WebP | Cabecera de hoja de Buscador | No | Laterales activos; zona central reservada a nombre, Origen, Arquetipo, Bríos, Defensa y Aguante. Evitar recortes laterales agresivos. |
| `ea-pnj-header.webp` | 1400×400 | WebP | Cabecera de PNJ | No | Más sobria que Buscador. Centro de baja actividad. Adecuada como `background-size: cover`. |
| `ea-surcazul-header.webp` | 1600×500 | WebP | Cabecera de Surcazul | No | Instrumentación fantástica abstracta sin controles falsos. Reservar centro para datos reales HTML/CSS. |
| `ea-sheet-surface.webp` | 1024×1024 | WebP | Fondo sutil de hojas | No | Textura de muy bajo contraste, preparada para repetición/recorte. No usar con opacidad adicional alta: podría perder por completo la referencia cartográfica. |
| `ea-naval-console.webp` | 1600×900 | WebP | Fondo de ApplicationV2 naval | No | Sin botones, números ni medidores. La región central está deliberadamente despejada para controles HTML/CSS. |
| `ea-divider.png` | 1600×120 | PNG | Separador cartográfico | Sí | Escala bien en horizontal. Para anchuras muy pequeñas, recortar simétricamente desde los extremos conservando el medallón central. |
| `ea-brio.png` | 512×512 | PNG | Medallón de Brío | Sí | Forma limpia para estados CSS activo/inactivo mediante brillo, saturación, opacidad o filtro. No contiene números. |
| `ea-portrait-frame.png` | 800×1000 | PNG | Marco de retrato | Sí | Interior prácticamente libre. Mantener proporción 4:5; evitar `object-fit: cover` sobre el propio marco. |
| `ea-ship-placeholder.webp` | 1200×800 | WebP | Placeholder de Surcazul | No | Composición con el navío a la izquierda y atmósfera oscura. Puede recortarse ligeramente por derecha; no conviene recortar el primer 45 % horizontal. |

## Danzarín del Vacío

No se incluye todavía `danzarin-del-vacio.webp`. La documentación disponible confirma que es el surcazul de exploración del grupo, estilizado, elegante, famoso por su velocidad y timón ligero, pero no aporta en el material recuperado suficientes rasgos visuales inequívocos para recrear un navío nominal sin inventar detalles concretos. Es preferible esperar a disponer de una referencia visual o descripción física adicional.

## Advertencia de coherencia

Los fondos ilustrativos y los elementos de interfaz se han tratado como una sola colección. Los PNG con alpha están diseñados para integrarse mediante CSS sin sombras exteriores gigantes. Los elementos cian funcionan mejor como acento y no deberían convertirse en una fuente de brillo continuo en toda la UI.

## Integración verificada 2026-09-06
Paquete aportado por ManuRomera para este proyecto. 12 imágenes, 803,7 KB en total; todos los WebP ya están optimizados (6–200 KB). Se mantienen sin recompresión destructiva. PNG con alpha conservado. Cabeceras por tipo, fondo naval, superficie tenue, hero y selección de sistema integrados. Brío usa medallón como decoración detrás del indicador accesible.

Marco 4:5 y divisor quedan disponibles como recursos opcionales; no se fuerzan en el retrato circular ni ocupan espacio funcional. El navío genérico se usa solo para Actors sin imagen propia, sin presentarlo como retrato oficial del Danzarín. No falta ningún asset necesario para usar la interfaz. Retrato específico del Danzarín sigue siendo opcional.
