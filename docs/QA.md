# QA · 2026-09-06

## Evidencia y alcance

Instancia aislada Foundry **13.351**, mundo nuevo `ea-laboratorio`. Sistema cargado sin CSB ni otros módulos. Antes de la capa de compatibilidad y del refactor, una macro ejecutada desde la UI de Foundry terminó con tarjeta **QA · 18/18**. La macro queda fuera de la distribución porque crea datos de laboratorio.

La suite real comprobó tres modelos Actor, dieciséis modelos Item, reserva de tres d10, autor PLAYER, repetición con coste, rechazo de revisión obsoleta sin coste, rechazo de usuario sin OWNER, ayuda de aliado con agotamiento, daño reducido, Herida, descanso, privacidad selfroll, compendio con página, render de las tres fichas, ausencia de overflow horizontal del cuerpo a 380×650 / 800×700 / 1000×800 / 1200×900, controles de arrays de Item y apertura de consola naval. La comprobación de arrays confirmó la presencia del control, no una edición persistida.

También se crearon un mundo y un Actor desde la interfaz y se pulsaron las tarjetas de Desafío/Brío. **Esta evidencia corresponde al código anterior al refactor, commit f4320ee, y no valida la candidata completa.**

## Matriz real

“Base” significa probado antes de los cambios actuales, pendiente de repetir. “Servicio” significa ejecutar la operación con un User real de Foundry, no iniciar sesión con ese usuario. Ningún test Node cuenta como QA v14.

| Funcionalidad | Foundry 13.351 | Foundry 14.x |
|---|---|---|
| Sistema detectado | Base: sí | Pendiente |
| Crear mundo | Base: sí, UI | Pendiente |
| Entrar como DJ | Base: sí | Pendiente |
| Crear Buscador | Base: sí | Pendiente |
| Crear PNJ | Base: sí, Document API | Pendiente |
| Crear Surcazul | Base: sí, Document API | Pendiente |
| Crear Items | Base: sí | Pendiente |
| Abrir hojas | Base: tres tipos | Pendiente |
| Editar hojas | Parcial; repetir submit y arrays | Pendiente |
| Resize | Base: cuatro tamaños | Pendiente |
| Container queries | Base: sin overflow del cuerpo; revisión visual incompleta | Pendiente |
| Drag Actor | Pendiente UI | Pendiente |
| Drag Item | Pendiente UI | Pendiente |
| Desafío | Base: sí | Pendiente |
| Reserva manual | Unitario, pendiente UI | Pendiente |
| Brío | Base: sí | Pendiente |
| Aptitud | Base: copia de dado | Pendiente |
| Vínculo | Base: servicio | Pendiente |
| Chat actions | Base: Desafío y Brío | Pendiente |
| Daño | Base: servicio | Pendiente |
| Heridas | Base: servicio | Pendiente |
| Condiciones | Unitario; pendiente UI | Pendiente |
| Descanso | Base: servicio | Pendiente |
| Consola naval | Base: abre y refleja distancia; flujo completo pendiente | Pendiente |
| Recarga navegador | Base: mundo y sistema; repetir acciones tras recarga | Pendiente |
| PLAYER | Base: autor y servicio; login pendiente | Pendiente |
| OWNER | Base: rechazo de no propietario | Pendiente |
| GM | Base: sesión y operaciones | Pendiente |
| Compendios | Base: página cargada desde LevelDB | Pendiente |
| Dice So Nice OFF | Base: tiradas funcionales | Pendiente |
| Dice So Nice ON | Pendiente | Pendiente |
| Consola JS limpia | Revisión final pendiente | Pendiente |
| Identidad y migración nuevas | Unitario; pendiente Foundry | Pendiente |
| Diagnóstico nuevo | Unitario; pendiente UI | Pendiente |
| Instalar manifest remoto limpio | Pendiente UI; descarga/ZIP se verifica aparte | Pendiente |

## Validaciones actuales independientes

23 tests Node: 13 reglas, 5 compatibilidad, 3 identidad y 2 composición/aislamiento del motor. Validador: versiones, sintaxis, traducciones declaradas, Handlebars, referencias de módulos/parciales, IDs raíz y páginas. Build genera LevelDB y ZIP de runtime por allowlist. CI ejecuta esas mismas comprobaciones; no dispone de licencia/runtime Foundry.

## Incidencias y correcciones

- Privacidad: el autor PLAYER se conserva cuando la DJ ejecuta la solicitud; selfroll no se dirige al GM activo.
- Revisión de chat: una petición obsoleta no cobra Brío.
- Plantillas: PARTS de subclases conserva explícitamente la cabecera; parciales se precargan por PARTS.templates.
- Identidad: textos anteriores migran a Items sin duplicarse al reintentar.
- Importación: el texto booleano "false" ya no embarca al tripulante.
- Captura preliminar: el navegador produjo una escala/recorte incorrectos. No se usa esa imagen como galería del producto.

## Bloqueos

El acceso al navegador fue rechazado por revisión automática al alcanzar el límite de uso. Impide repetir la UI y obtener capturas completas; no se eludió con otro mecanismo. No hay runtime v14 disponible localmente y el cambio de generación exige instalación manual. La candidata no es una release final validada en ambas generaciones. verified permanece 13.351, última versión con evidencia real del sistema base.
