# Auditoría CSB

Referencia: pedrobaringo/eterno-azul-csb, commit 2626f70a63a4b010d50a75520c39755d3da014bd, módulo 2.0.1. Estudiado como especificación, sin copiar código ni assets. No hay LICENSE de redistribución en el checkout.

Se abrieron ambos packs con classic-level 2, iterando todas las claves. Actor: bMRRxwbp9ZuM18Vw (PJ), puejvdJnv5wJVwYQ (navío), zwlkTUB4Xkqaki4g (PNJ). Item: AjsC24bEpD5PC3rO (equipo). 172/53/15/37 componentes con key respectivamente, incluidos duplicados. Las extracciones quedan fuera del repositorio público.

RadioButton de CSB guarda system.props[group], no la key visual del componente. Acciones: armonizarradio, combatirradio, explorarradio, influirradio, maniobrarradio, navegarradio, picardearradio, resistirradio, saberradio, trastearradio. Señas: sena1…6 y sendaradio1…6. Bríos: brio1…6 booleanos. Origen/arquetipo son textos. Aptitudes: origenapt, arquetipoapt y tabla aptother. Salud: defact, aguanttot, aguanteact y heridas con nombre/gravedad. Vínculos: vinc1 y sufijos _copy1; checks independientes. Equipo: tipoequipo 1–5, bultoequip, usosequip, danoarma, defensaarma, danobateria, cantmunic, etiquetasequipo.

## Tiradas
Diez fórmulas normales y diez alternativas. Normal: copias de Acción + Seña (d6 si ninguna) + Ventajas d6; Vínculo numérico suma éxitos. Manual Mayús: cantidades por dado. 4–7 aporta 1, 8+ aporta 2. Superar Riesgo es éxito limpio; cero queda en manos de DJ; otro resultado tiene consecuencia.

## Fallos detectados
- Repeticiones clasifican éxitos por debajo del Riesgo como fallo, contradiciendo la tirada inicial y Guía p.11.
- Repetición de Brío omite copias adicionales de Acción al contar resultados.
- Repetición selectiva intercambia etiquetas/términos de dados y omite d4.
- Bríos capturados al crear mensaje: estado obsoleto al pulsar después.
- Listeners añadidos con setTimeout; desaparecen tras recarga.
- Dice So Nice se consulta sin comprobar existencia del módulo.
- CSS global, fuentes y marcos sin licencia separada.
- Vínculo libre no comprueba propietario, destinatario ni agotamiento.

## Reimplementación
Motor único puro; mensajes con flags y revisión; transacciones serializadas por Actor en GM activo; comprobación actual de permisos y recursos; repetición conserva identidad y tamaño de cada dado. Items especializados reemplazan tablas y campos duplicados. Se preserva exportación original en importación local para revisión, nunca se evalúan fórmulas CSB.
