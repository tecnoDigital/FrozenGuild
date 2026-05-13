# Frozen Guild — Investigación UI tipo Marvel Snap aplicada al área del dado

## 0. Objetivo

Este documento resume lo investigado sobre **Marvel Snap / Second Dinner** y lo aterriza a una decisión concreta para Frozen Guild:

> El dado no debe sentirse como un botón administrativo. Debe sentirse como una **consola de decisión del turno**: se activa, revela la acción obligatoria y transfiere la atención al tablero.

La aplicación concreta será sobre el `DicePanel` y su relación con `ActionPanel`, El Hielo 3x3 y las cartas seleccionables.

---

## 1. Conclusión rápida

Si Second Dinner resolviera el dado de Frozen Guild, probablemente no lo pondría como:

```txt
🎲 Dado: 1    [Lanzar dado]
```

Lo convertiría en un módulo de estado/acción con mucha claridad:

```txt
┌────────────────────────────┐
│ TU TURNO                   │
│                            │
│        [ DADO 3D ]          │
│                            │
│ Lanza para revelar acción   │
│         LANZAR              │
└────────────────────────────┘
```

Y después de tirar:

```txt
┌────────────────────────────┐
│ RESULTADO                  │
│                            │
│            1               │
│          PESCA             │
│                            │
│ Elige una carta del Hielo   │
└────────────────────────────┘
```

La animación del dado debe ser espectacular solo en el momento de decisión. Después debe bajar de protagonismo y hacer que el tablero/carta válida se vuelva el foco.

---

## 2. Fuentes revisadas

No encontré un “paper académico” específico de Second Dinner sobre distribución visual de Marvel Snap. Lo que sí existe son fuentes útiles: páginas oficiales, portfolio de UI/UX, charlas GDC, entrevistas y análisis de UX.

| Fuente | Tipo | Qué aporta |
|---|---:|---|
| Marvel.com — *Introducing MARVEL SNAP...* | Oficial | Confirma que Marvel Snap es desarrollado por Second Dinner, publicado por Nuverse y planteado como card battler rápido de móvil y PC. |
| Marvel Snap official site | Oficial | Define el juego como fast-paced collectible card game, con partidas de aproximadamente 3 minutos. |
| Tiffany Smart — Marvel Snap UI/UX portfolio | Portfolio profesional | Habla de mejoras al tablero principal, HUD inferior simplificado, bordes/indicadores de ubicación y conceptos de motion para turn banner/end game. |
| Game Developer — *Why Second Dinner first prototyped Marvel Snap using physical cards* | Entrevista / análisis de diseño | Explica el prototipado físico con cartas y cómo eso fuerza lectura corta, lógica clara y habilidades entendibles. |
| GDC Vault — *Designing MARVEL SNAP* | Charla GDC | Describe la charla de Ben Brode sobre diseño de Snap, batallas de tres minutos, ubicaciones y apuestas tipo doubling cube. |
| Mobilegamer.biz — *Second Dinner reveals the secrets of Marvel Snap’s onboarding and card design* | Reporte de GDC | Muestra una filosofía clave: resolver problemas de sistema sin añadir complejidad innecesaria, como evitar mulligan y resolverlo con diseño de cartas. |
| Medium — *Marvel’s Snap UI/UX Case Study* | Análisis externo no oficial | Útil para detectar problemas de UX: repetición de navegación, targets mal ubicados y riesgos de acciones críticas cerca de zonas de error. |
| Unity — *Marvel Snap Case Study* | Caso técnico | Relevante para entender el énfasis en arte, cartas, animación y parallax como parte del atractivo visual. |

### Links

- Marvel.com — Introducing MARVEL SNAP: https://www.marvel.com/articles/games/introducing-marvel-snap-an-action-packed-collectible-card-game-from-nuverse-and-second-dinner
- Marvel Snap official site: https://marvelsnap.com/
- Tiffany Smart — Marvel Snap UI/UX: https://www.tiffanysmart.com/work/marvel-snap
- Game Developer — Physical card prototype: https://www.gamedeveloper.com/design/why-second-dinner-first-prototyped-marvel-snap-using-physical-cards
- GDC Vault — Designing MARVEL SNAP: https://gdcvault.com/play/1029024/Designing-MARVEL-SNAP
- Mobilegamer.biz — Onboarding and card design: https://mobilegamer.biz/second-dinner-reveals-the-secrets-of-marvel-snaps-onboarding-and-card-design/
- Medium — UI/UX Case Study: https://medium.com/design-bootcamp/marvels-snap-ui-ux-case-study-9f727d8f3875
- Unity — Marvel Snap Case Study: https://unity.com/resources/marvel-snap

---

## 3. Conocimiento adquirido de Marvel Snap / Second Dinner

### 3.1 Las cartas son el centro del show

Marvel Snap parece construir su interfaz para que las cartas, ubicaciones y resultados sean lo principal. El portfolio de Tiffany Smart menciona mejoras al tablero principal, HUD inferior simplificado e indicadores visuales para comunicar quién va ganando una ubicación.

**Aprendizaje para Frozen Guild:**  
El dado no debe competir de forma permanente con las cartas. Debe tener un momento fuerte, pero luego devolver el foco al tablero y a la mano.

---

### 3.2 El HUD debe resumir mucho con poco

Un punto valioso del portfolio de UI es el “simplified bottom HUD”: mucha información presentada de forma compacta.

**Aprendizaje para Frozen Guild:**  
El panel de dado no debe llenarse de texto. Debe tener estados muy cortos:

```txt
TU TURNO
LANZA EL DADO
```

```txt
PESCA
Elige 1 carta del Hielo
```

```txt
ACCIÓN COMPLETADA
Termina tu turno
```

---

### 3.3 La acción debe guiar el siguiente paso, no solo celebrar el resultado

Marvel Snap usa feedback visual para que el jugador entienda qué pasó y qué importa después. El feedback no es solo “bonito”; comunica estado.

**Aprendizaje para Frozen Guild:**  
Cuando salga `1`, el dado no debe quedarse celebrando. Debe activar inmediatamente el lenguaje visual de Pesca:

- slots válidos del Hielo con glow;
- texto breve “Elige una carta del Hielo”;
- ActionPanel sincronizado;
- botón de terminar turno oculto o desactivado hasta resolver la acción.

---

### 3.4 Texto corto por restricción real de cartas

El prototipado físico de Marvel Snap con cartas obligó a que los efectos fueran legibles en poco espacio. La regla de oro es que la UI no debe convertir la partida en lectura pesada.

**Aprendizaje para Frozen Guild:**  
No usar explicaciones largas dentro del panel derecho. La explicación larga vive en tutorial/reglas; durante partida solo frases operativas.

Mal:

```txt
Has obtenido un resultado de dado igual a uno, por lo tanto debes proceder a seleccionar una carta del tablero central llamado El Hielo...
```

Bien:

```txt
PESCA
Elige 1 carta del Hielo
```

---

### 3.5 Mejor resolver complejidad desde diseño, no agregando más pasos

En el reporte de Mobilegamer sobre GDC, Second Dinner evitó agregar mulligan porque podía hacer más lento y complejo el juego para nuevos jugadores; resolvieron el problema con diseño de cartas.

**Aprendizaje para Frozen Guild:**  
No agregar otro modal para el dado. No agregar un segundo botón innecesario. No abrir un overlay si no hace falta. El flujo debe ser:

```txt
Tirar dado → revelar acción → seleccionar objetivo → resolver → terminar turno
```

Una cosa a la vez.

---

### 3.6 Targets claros y seguros

El análisis UX externo de Marvel Snap señala problemas típicos cuando los botones críticos están ubicados donde pueden provocar errores o no son claros.

**Aprendizaje para Frozen Guild:**  
El dado puede ser clicable, pero el botón/área de interacción debe ser clara y segura. Después de tirar, no debe quedar una acción peligrosa disponible por accidente. “Terminar turno” debe aparecer solo cuando realmente procede.

---

## 4. Traducción directa a Frozen Guild

### 4.1 Restricciones internas del juego

Frozen Guild tiene reglas que hacen que el dado sea central:

- Hay un solo lanzamiento por turno.
- No existe reroll.
- El servidor guarda el resultado.
- El jugador ejecuta una acción obligatoria según el dado.
- El cliente solo solicita acciones; el servidor valida.

Por eso, el dado no es decoración. Es el disparador formal del turno.

### 4.2 Mapeo real del dado

```txt
1, 2, 3 → Pesca
4       → Espionaje
5       → Intercambio
6       → El Padrino
```

El prototipo actual de dado no debe usar un `actionPool` libre tipo `["EL PADRINO", "PESCA", "SPY", "SNAP", "HIELO", "ROBO"]` para producción. Eso está bien para preview, pero para el juego real debe mapearse al resultado del servidor.

---

## 5. Diagnóstico del estado actual en la captura

La UI actual ya tiene buena base:

- El Hielo 3x3 está claro.
- La mano abajo se entiende.
- La columna derecha ya tiene una zona natural para dado/acciones.
- El estilo hielo/neón funciona.

Pero el dado todavía se siente como elemento administrativo:

```txt
🎲 Dado: 1    [Lanzar dado]
```

Problemas:

1. El dado tiene poco peso visual.
2. El botón rectangular compite con el propio dado.
3. El resultado no se transforma claramente en instrucción.
4. El panel de acción y el panel de dado parecen dos módulos separados.
5. Falta una coreografía clara del turno.

---

## 6. Propuesta: DicePanel como “Consola de Decisión”

### 6.1 Ubicación

Mantenerlo en la **columna derecha inferior**.

No debe ir encima del tablero. El centro debe seguir siendo El Hielo y las cartas.

```txt
┌─────────────────────┐
│ Ledger / rivales    │
│                     │
├─────────────────────┤
│ Consola de turno    │
│ Dado + Acción       │
└─────────────────────┘
```

### 6.2 Forma visual

Un panel tipo consola holográfica de hielo:

- fondo oscuro translúcido;
- borde cyan suave;
- glow solo cuando es tu turno;
- dado 3D montado sobre una base circular;
- resultado grande;
- texto mínimo;
- `ActionPanel` integrado o pegado visualmente al `DicePanel`.

### 6.3 El dado debe ser el botón

En vez de:

```txt
[Dado visual] [Lanzar dado]
```

Usar:

```txt
[ DADO 3D CLICABLE ]
Lanzar dado
```

O:

```txt
[ DADO 3D ]
[ LANZAR ]
```

Pero el botón no debe parecer un botón administrativo de formulario. Debe parecer la base de activación del artefacto.

---

## 7. Estados propuestos del DicePanel

### Estado 1 — Esperando turno

```txt
ESPERANDO
Turno de BOT 1
```

Visual:

- panel atenuado;
- dado pequeño o congelado;
- sin hover fuerte;
- no permite click.

---

### Estado 2 — Listo para tirar

```txt
TU TURNO
Lanza para revelar acción
```

Visual:

- borde del panel respira suavemente;
- dado en idle con brillo bajo;
- hover levanta el dado 3-4px;
- cursor pointer;
- click en dado o base.

---

### Estado 3 — Rodando

```txt
RODANDO...
Calculando acción
```

Visual:

- dado gira 3D;
- botón bloqueado;
- glow de base más fuerte;
- no mostrar todavía el resultado real hasta que llegue/resuelva el estado del servidor;
- duración recomendada visual: 700ms-1100ms.

---

### Estado 4 — Resultado revelado

```txt
RESULTADO
1 · PESCA
Elige 1 carta del Hielo
```

Visual:

- número grande;
- micro-impacto controlado;
- acción aparece con motion corto;
- se iluminan objetivos válidos en tablero/mano.

---

### Estado 5 — Acción pendiente

```txt
PESCA
Elige 1 carta del Hielo
```

Visual:

- dado baja en importancia;
- ActionPanel toma protagonismo;
- tablero muestra slots válidos;
- no mostrar “Terminar turno” como acción principal todavía.

---

### Estado 6 — Acción completada

```txt
ACCIÓN COMPLETADA
Termina tu turno
```

Visual:

- dado queda como resumen;
- botón principal ahora sí es “Terminar turno”;
- tablero vuelve a estado neutral.

---

## 8. Flujo de atención deseado

La lectura debe ser:

```txt
1. Miro centro: tablero + mano.
2. Voy a derecha: tiro dado.
3. El dado revela acción.
4. Mi mirada vuelve al centro: cartas/slots válidos.
5. Resuelvo acción.
6. Regreso a derecha: terminar turno.
```

Esto es más fuerte que poner un dado gigante encima del tablero porque mantiene la mesa limpia.

---

## 9. Integración con el stack actual

### 9.1 Principio técnico

La animación puede existir en cliente, pero la tirada real debe venir de boardgame.io / servidor.

No usar en producción:

```ts
const value = Math.floor(Math.random() * 6) + 1;
```

Usar:

```ts
moves.rollDice();
```

Y luego derivar UI desde el estado:

```ts
const diceValue = G.dice.value;
const diceRolled = G.dice.rolled;
const pendingStage = G.pendingStage;
```

### 9.2 Selector recomendado

```ts
function getDiceAction(value: number | null) {
  if (value == null) return null;

  if (value >= 1 && value <= 3) {
    return {
      key: "fish",
      label: "PESCA",
      instruction: "Elige 1 carta del Hielo",
    };
  }

  if (value === 4) {
    return {
      key: "spy",
      label: "ESPIONAJE",
      instruction: "Mira hasta 3 cartas del Hielo",
    };
  }

  if (value === 5) {
    return {
      key: "swap",
      label: "INTERCAMBIO",
      instruction: "Elige dos cartas para intercambiar",
    };
  }

  return {
    key: "padrino",
    label: "EL PADRINO",
    instruction: "Elige una acción del 1 al 5",
  };
}
```

### 9.3 Estado visual derivado

```ts
const isLocalTurn = ctx.currentPlayer === localPlayerID;
const hasBlockingStage = Boolean(G.pendingStage);
const canRoll = isLocalTurn && !G.dice.rolled && !hasBlockingStage;
const hasResult = G.dice.rolled && G.dice.value !== null;
const action = getDiceAction(G.dice.value);
```

### 9.4 Fases UI recomendadas

```ts
type DicePanelPhase =
  | "waiting"
  | "ready"
  | "rolling"
  | "result"
  | "actionPending"
  | "completed"
  | "blocked";
```

La fase `rolling` puede ser local/transitoria, pero no debe cambiar el resultado. Solo maquilla la espera.

---

## 10. Relación con `ActionPanel`

La decisión más importante: `DicePanel` y `ActionPanel` no deben sentirse como dos tarjetas separadas.

Deben funcionar como un solo módulo:

```txt
┌──────────────────────────────┐
│ TU TURNO                     │
│                              │
│        [ DADO 3D ]            │
│                              │
│ Lanza para revelar acción     │
├──────────────────────────────┤
│ Acción actual                │
│ —                            │
└──────────────────────────────┘
```

Después de tirar:

```txt
┌──────────────────────────────┐
│ RESULTADO                    │
│ 1 · PESCA                    │
│ Elige 1 carta del Hielo       │
├──────────────────────────────┤
│ Objetivos válidos: 9          │
│ Selecciona una carta          │
└──────────────────────────────┘
```

Después de resolver:

```txt
┌──────────────────────────────┐
│ ACCIÓN COMPLETADA            │
│ Pescaste una carta            │
├──────────────────────────────┤
│ [ TERMINAR TURNO ]            │
└──────────────────────────────┘
```

---

## 11. Microcopy recomendado

### Antes de tirar

```txt
TU TURNO
Lanza para revelar acción
```

### Rodando

```txt
RODANDO...
```

### Pesca

```txt
PESCA
Elige 1 carta del Hielo
```

### Espionaje

```txt
ESPIONAJE
Mira hasta 3 cartas
```

### Intercambio

```txt
INTERCAMBIO
Elige dos cartas
```

### El Padrino

```txt
EL PADRINO
Elige una acción
```

### Bloqueado por stage

```txt
RESOLUCIÓN OBLIGATORIA
Resuelve antes de continuar
```

### Acción completada

```txt
ACCIÓN COMPLETADA
Termina tu turno
```

---

## 12. Reglas visuales para que se sienta premium

1. **El dado no debe estar en una caja plana.** Debe tener base, sombra y glow.
2. **El panel no debe parecer formulario.** Evitar botón chico gris/azul tipo admin.
3. **El resultado debe ser grande.** Número + acción deben leerse en menos de un segundo.
4. **El panel debe respirar solo cuando es tu turno.** No todo debe brillar siempre.
5. **El tablero debe responder al resultado.** Si sale Pesca, El Hielo se ilumina.
6. **La animación no debe bloquear comprensión.** Máximo 1.1s para no hacer lento el turno.
7. **El dado no debe tapar cartas.** No overlay central salvo efecto muy puntual de impacto.
8. **La acción crítica debe aparecer cuando corresponde.** “Terminar turno” solo después de resolver.

---

## 13. Qué tomar del prototipo de dado actual

Del preview actual conviene conservar:

- cubo 3D CSS;
- `DiceFace`;
- pips por cara;
- `faceTarget`;
- fase `rolling / settling / landed`;
- `ResultNumber`;
- `ActionBadge`;
- panel glass con borde y glow.

Pero hay que cambiar:

- quitar `Math.random()` del cliente para producción;
- quitar `actionPool` libre;
- conectar resultado a `G.dice.value`;
- mapear acción real del MVP;
- adaptar layout a columna derecha, no a panel horizontal gigante;
- hacer que `ActionBadge` dicte el próximo objetivo visual.

---

## 14. Propuesta de componente final

```txt
DicePanel
├─ TurnStateHeader
├─ DiceActivator
│  └─ Dice3D
├─ DiceResult
│  ├─ ResultNumber
│  └─ ActionBadge
└─ ActionInstruction
   ├─ InstructionText
   └─ PrimaryActionButton
```

### Props sugeridas

```ts
type DicePanelProps = {
  diceValue: number | null;
  diceRolled: boolean;
  currentPlayerID: string;
  localPlayerID: string;
  pendingStage: PendingStageView | null;
  actionResolved: boolean;
  onRollDice: () => void;
  onEndTurn: () => void;
};
```

---

## 15. Criterios de aceptación

El cambio está bien implementado si:

- El dado se entiende como inicio del turno.
- El jugador entiende si puede o no puede tirar.
- Al tirar, el resultado se transforma en acción.
- La acción muestra instrucción corta.
- El tablero/mano muestra objetivos válidos.
- El botón “Terminar turno” aparece solo cuando la acción ya se completó.
- El dado no usa random local para el resultado real.
- La animación no tapa El Hielo.
- El panel derecho deja de sentirse como formulario y se siente como parte del juego.

---

## 16. Prompt corto para el agente

```txt
Rediseña el DicePanel de Frozen Guild como una consola de decisión premium inspirada en la lógica UX de Marvel Snap, sin copiar su estética literal.

El dado debe ser el elemento interactivo principal, montado sobre una base holográfica de hielo. Debe tener estados claros: waiting, ready, rolling, result, actionPending, completed y blocked.

Al lanzar, llama moves.rollDice(); no generes el resultado real con Math.random en cliente. Usa G.dice.value y G.dice.rolled para mostrar el resultado. Mapea el dado así: 1-3 Pesca, 4 Espionaje, 5 Intercambio, 6 El Padrino.

Después de revelar el resultado, el panel debe mostrar una instrucción corta y transferir la atención al tablero iluminando objetivos válidos. El dado no debe ser un overlay sobre el tablero ni un botón administrativo separado. Debe integrarse con ActionPanel en la columna derecha inferior.

Mantén la UI limpia, fría, polar, funcional y jugable. No agregues drag & drop, skins, chat ni lógica crítica duplicada. La validación definitiva sigue en servidor.
```

---

## 17. Decisión final

Para Frozen Guild, la zona del dado debe convertirse en:

> **Consola de turno / consola de decisión.**

No es “el dado y un botón”. Es el punto donde el turno se activa, el sistema revela intención y la mesa guía al jugador.

La frase rectora:

> Tirar dado → revelar acción → iluminar objetivo → ejecutar → terminar turno.

Esa coreografía es más importante que solo poner una animación bonita.
