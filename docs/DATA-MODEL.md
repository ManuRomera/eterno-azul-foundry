# Modelo de datos

Actor Buscador: identity {originId, archetypeId}, brio/defense {value,max}, stamina, damage, actions (dado por key), loot, kit, biography, background, notes, shipUuid, lastRest, schemaVersion. bulk y out son derivados.

Actor PNJ: threat, stamina, damage, traits, characteristicActions, attacks, description, notes. No tira Desafíos.

Actor Surcazul: class, maneuver, sail, power, hold, hull, heart, damage, crew [{uuid,name,role,present}], cargo, supplies, passengers, state, description, notes; naval {opponentUuid,distance,pursuer,moored,context}. Distancias 0 abordaje, 1 fuego, 2 seguimiento, 3 avistamiento, 4 escapado.

Items: origen, arquetipo, aptitud, pertrecho, arma, armadura, verbo, ritual, bateria, municion, mejora, condicion, herida, desperfecto, sena, vinculo. Cada tipo tiene esquema propio y solo campos aplicables.

Effect: kind, actions, cost, value, trigger, citation. Los cambios mecánicos exigen referencia y selección contextual. Los efectos narrativos y efectos aún no automatizados se conservan como datos.

Condición: intensity, duration, visibility, narrative, effect, limitedUses, expiresAfterDuration, active. Herida/Desperfecto: severity y affectedActions. Seña: die y archetype. Vínculo: targetUuid, targetName, targetImg, description y exhausted.

Visibilidad de la interfaz no equivale a secreto: los observadores de Actor reciben datos completos. Los secretos de DJ se guardan en Diarios con permisos privados.

ChatMessage flags.eterno-azul.challenge: actorUuid, action, signName, context, pool, results, risk, successes, outcome, successMargin, consequenceMargin, bondBonus, bonds, revision, history, forced, bravata. Peticiones independientes identifican actorUuid, operation, payload y status.

## Identidad estructurada
Origen y Arquetipo son Items enlazados por system.identity. La cabecera resuelve esos documentos. Los campos origin/archetype del esquema solo permiten leer Actors anteriores y se vacían tras migración segura; no se editan desde la UI. Importación y asistente crean Items directamente.
