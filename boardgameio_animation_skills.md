# Guía de Skills y Arquitectura de Animaciones para el Proyecto boardgame.io

## 1. Objetivo del documento

Este documento define una estrategia práctica para implementar animaciones fluidas, limpias y de alto nivel en el proyecto de juego basado en `boardgame.io`.

La meta no es simplemente “poner animaciones”, sino crear una capa visual profesional que mejore la experiencia del usuario sin contaminar la lógica del juego, sin romper el multiplayer y sin volver el MVP innecesariamente complejo.

---

## 2. Stack identificado del proyecto

El stack actual del juego es:

```txt
Frontend: React + Vite
Game engine: boardgame.io
Backend: Node.js
Persistencia: SQLite
Deploy: Nginx + PM2
UI/Animación sugerida: Motion / Framer Motion + bgio-effects + GSAP selectivo
```

### Lectura técnica

`boardgame.io` debe encargarse de:

- Reglas del juego.
- Estado autoritativo.
- Fases.
- Turnos.
- Moves.
- Sincronización multiplayer.
- Logs.

React debe encargarse de:

- Renderizar el tablero.
- Renderizar cartas, mesas, jugadores y estados visuales.
- Ejecutar animaciones.
- Mostrar transiciones de turno.
- Dar feedback visual al usuario.

La animación no debe vivir dentro de las `moves` de boardgame.io.

---

## 3. Principio central de arquitectura

### Regla principal

```txt
Las moves cambian estado.
La UI interpreta el estado.
La capa de efectos anima la experiencia.
```

Nunca debemos depender de que una animación termine para que el juego avance.

El juego debe seguir funcionando aunque:

- La animación falle.
- El usuario tenga bajo rendimiento.
- El navegador reduzca frames.
- El usuario tenga `prefers-reduced-motion` activado.
- Un jugador se desconecte.

---

## 4. Arquitectura recomendada de animación

```txt
boardgame.io move
      ↓
Actualización de G / ctx
      ↓
bgio-effects o diff visual
      ↓
React recibe evento visual
      ↓
Motion o GSAP ejecuta animación
      ↓
Howler reproduce sonido opcional
```

### Capas sugeridas

```txt
/game
  rules.ts
  moves.ts
  phases.ts
  setup.ts

/client
  Board.tsx
  components/
    Card.tsx
    PlayerArea.tsx
    TableSlot.tsx
    TurnBanner.tsx
  animation/
    animationEvents.ts
    animationQueue.ts
    useCardAnimation.ts
    useTurnAnimation.ts
    useReducedMotionSafe.ts
  effects/
    boardEffects.ts
    soundEffects.ts
```

---

## 5. Librerías recomendadas

## 5.1 Motion / Framer Motion

### Uso recomendado

Usar Motion para:

- Entrada y salida de cartas.
- Hover elegante.
- Selección de carta.
- Transiciones de turno.
- Aparición de modales.
- Cambio de estado de una mesa.
- Movimiento simple de componentes React.

### Ventaja

Es la opción más natural para React. Permite animaciones declarativas sin meter demasiada complejidad.

### Casos ideales en este juego

```txt
- Carta entra a la mano.
- Carta se selecciona.
- Carta se revela.
- Mesa pasa de inactiva a activa.
- Jugador queda ausente.
- Banner de turno aparece.
```

---

## 5.2 GSAP

### Uso recomendado

Usar GSAP solo para momentos especiales y secuencias coreografiadas.

No debe usarse para todo.

### Casos ideales

```txt
- Carta robada que vuela desde un deck hacia una mano.
- Explosión de primera y segunda carta.
- Robo de carta entre jugadores.
- Secuencia de final de ronda.
- Animación premium de victoria o derrota.
- Combo visual con sonido sincronizado.
```

### Ventaja

GSAP es mejor que Motion cuando hay una secuencia compleja con varios pasos encadenados.

Ejemplo conceptual:

```txt
1. Carta tiembla.
2. Carta se ilumina.
3. Carta sube.
4. Carta rota.
5. Carta explota.
6. Sonido.
7. Estado visual final.
```

---

## 5.3 bgio-effects

### Uso recomendado

Usar `bgio-effects` como puente entre la lógica de boardgame.io y los efectos visuales temporales.

### Qué problema resuelve

Hay eventos que no deberían permanecer en el estado del juego.

Por ejemplo:

```txt
- Reproducir sonido de carta robada.
- Mostrar animación de explosión.
- Sacudir la mesa.
- Marcar visualmente que alguien robó una carta.
- Mostrar feedback de desconexión.
```

Estos efectos son efímeros. No deberían contaminar `G`.

---

## 5.4 Howler.js

### Uso recomendado

Usar Howler para sonido corto y sincronizado con animaciones.

### Casos ideales

```txt
- Carta revelada.
- Click de selección.
- Explosión.
- Turno nuevo.
- Jugador ausente.
- Mesa activada.
```

El sonido debe poder desactivarse desde configuración.

---

## 5.5 Rive

### Uso recomendado

Usar Rive en una fase posterior si queremos:

- Personajes vivos.
- Mascotas.
- Avatares animados.
- Iconos interactivos premium.
- Estados emocionales del juego.

No es necesario para el MVP.

---

## 5.6 Lottie

### Uso recomendado

Usar Lottie para efectos visuales ya diseñados:

- Confetti.
- Fuego.
- Brillos.
- Aura.
- Stickers animados.
- Celebraciones.

Es útil si se tienen assets exportados desde After Effects.

---

## 5.7 PixiJS

### Uso recomendado

No usar PixiJS en el MVP salvo que sea estrictamente necesario.

PixiJS es potente, pero puede agregar complejidad innecesaria.

Usarlo solo si el juego evoluciona hacia:

- Muchas partículas.
- Tablero con gran cantidad de elementos.
- Animaciones 2D intensas.
- Efectos tipo arcade.
- Rendering fuera del DOM.

---

## 6. Skills recomendadas para agentes

## 6.1 Skills externas útiles

Buscar o instalar skills relacionadas con:

```txt
GSAP React
GSAP Timeline
GSAP Performance
Framer Motion / Motion
React Game UI
React Animation Patterns
```

Las skills de GSAP son especialmente útiles porque ayudan al agente a evitar errores comunes como:

- No limpiar animaciones al desmontar componentes.
- Animar propiedades costosas.
- Crear timelines imposibles de mantener.
- Generar fugas de memoria.
- Romper ciclos de React.

---

## 6.2 Skill custom recomendada

Crear una skill específica para este proyecto:

```md
# boardgameio-animation-director

You are an expert in boardgame.io, React, Vite, Motion, GSAP, bgio-effects, and game-feel animation.

Your job is to create smooth, clean, multiplayer-safe animations for a boardgame.io project.

## Core rules

- Never put visual animation logic inside boardgame.io moves.
- Moves must only mutate deterministic game state.
- React components render the state.
- Ephemeral visual feedback must be handled with bgio-effects or a dedicated client-side animation event layer.
- Use Motion for normal UI animation.
- Use GSAP only for complex timeline sequences.
- Use Howler for sound feedback when needed.
- All animations must be optional and non-blocking.
- If animation fails, the game must continue.
- Support prefers-reduced-motion.
- Avoid layout-heavy animations.
- Prefer transform and opacity.
- Never animate width, height, top, left, margin, or padding unless there is a strong reason.
- Keep multiplayer deterministic.
- Do not store animation-only state inside G unless it affects actual game rules.

## Recommended animation events

- card_drawn
- card_played
- card_revealed
- card_stolen
- card_exploded
- player_absent
- player_reconnected
- table_activated
- turn_started
- round_ended
- game_finished

## Output expectations

When generating code:

- Keep animation hooks small.
- Separate animation orchestration from visual components.
- Use reusable animation variants.
- Include cleanup logic.
- Include reduced-motion fallback.
- Do not introduce unnecessary global state.
- Do not block moves while animations run.
```

---

## 7. Eventos visuales sugeridos para el juego

## 7.1 Cartas

```txt
card_drawn
card_selected
card_unselected
card_played
card_revealed
card_stolen
card_destroyed
card_exploded
```

## 7.2 Jugadores

```txt
player_turn_started
player_absent_warning
player_marked_absent
player_reconnected
player_eliminated
```

## 7.3 Mesas

```txt
table_activated
table_paused
table_locked
table_resolved
```

## 7.4 Ronda

```txt
round_started
round_ended
countdown_started
countdown_finished
victory_sequence
loss_sequence
```

---

## 8. Nivel de animación por etapa

## Etapa MVP

Usar solo animaciones esenciales:

```txt
- Hover de cartas.
- Selección de carta.
- Entrada/salida de cartas.
- Cambio de turno.
- Estado de jugador ausente.
- Activación de mesa.
```

Tecnología recomendada:

```txt
Motion + CSS transitions simples
```

---

## Etapa Post-MVP

Agregar game-feel más fuerte:

```txt
- Carta robada con movimiento visible.
- Carta explotada.
- Sonidos cortos.
- Microinteracciones más expresivas.
- Feedback visual de acciones importantes.
```

Tecnología recomendada:

```txt
Motion + bgio-effects + Howler
```

---

## Etapa Premium

Agregar secuencias especiales:

```txt
- Animaciones coreografiadas con timeline.
- Victoria/derrota cinematográfica.
- Efectos de partículas.
- Assets animados.
- Mascotas o avatares vivos.
```

Tecnología recomendada:

```txt
GSAP + Rive + Lottie
```

---

## 9. Reglas de performance

Para que la UI se sienta fluida:

```txt
Preferir:
- transform
- opacity
- scale
- rotate
- translate3d

Evitar:
- width
- height
- top
- left
- margin
- padding
- box-shadow animado excesivo
- filtros pesados en muchos elementos
```

### Regla práctica

Si una animación afecta layout, probablemente va a sentirse menos fluida.

Si una animación usa `transform`, probablemente será más estable.

---

## 10. Patrón recomendado para animaciones de cartas

### Estructura conceptual

```tsx
<Card
  id={card.id}
  state={visualState}
  onClick={() => moves.playCard(card.id)}
/>
```

La carta no debe decidir la regla.

La carta solo debe:

- Renderizarse.
- Mostrar estado visual.
- Ejecutar microinteracciones.
- Llamar una move cuando el usuario actúa.

---

## 11. Patrón recomendado para efectos efímeros

Ejemplo conceptual:

```txt
move: stealCard()
  ↓
Actualiza G
  ↓
Emite efecto: card_stolen
  ↓
Cliente escucha efecto
  ↓
UI anima carta moviéndose de jugador A a jugador B
```

Este patrón evita guardar en el estado cosas como:

```txt
isCurrentlyAnimating
animationStep
explosionVisible
soundAlreadyPlayed
```

Ese tipo de datos no pertenece al estado autoritativo del juego.

---

## 12. Riesgos técnicos

## Riesgo 1: Animaciones dentro de moves

Problema:

```txt
La lógica de juego se mezcla con la presentación.
```

Consecuencia:

```txt
Difícil de testear, difícil de sincronizar, fácil de romper en multiplayer.
```

Solución:

```txt
Moves puras + efectos visuales separados.
```

---

## Riesgo 2: Sobrecargar el MVP

Problema:

```txt
Meter PixiJS, Rive, GSAP, Lottie y Motion desde el inicio.
```

Consecuencia:

```txt
Más dependencias, más bugs, más fricción para terminar el MVP.
```

Solución:

```txt
MVP con Motion.
Post-MVP con bgio-effects y Howler.
Premium con GSAP/Rive/Lottie.
```

---

## Riesgo 3: Animaciones no deterministas que afectan gameplay

Problema:

```txt
Esperar a que termine una animación para aplicar una regla.
```

Consecuencia:

```txt
Desincronización entre clientes.
```

Solución:

```txt
El estado cambia primero.
La animación solo representa visualmente lo que ya ocurrió.
```

---

## 13. Criterios de aceptación

Una animación se considera correcta si cumple:

```txt
- No rompe el estado de boardgame.io.
- No bloquea el gameplay.
- No depende del tiempo exacto para que la regla funcione.
- Tiene fallback si el usuario reduce movimiento.
- Se limpia correctamente al desmontar componentes.
- No genera errores si el jugador se desconecta.
- Se siente fluida en una laptop normal.
- No agrega complejidad innecesaria.
```

---

## 14. Decisión recomendada

Para el proyecto actual, la mejor decisión es:

```txt
Base inmediata:
- React + Vite
- boardgame.io
- Motion / Framer Motion

Capa de efectos:
- bgio-effects

Sonido:
- Howler.js

Animaciones premium específicas:
- GSAP

No usar todavía:
- PixiJS
- Rive
- Lottie
```

PixiJS, Rive y Lottie deben quedar como recursos posteriores, no como parte del primer MVP.

---

## 15. Plan de implementación sugerido

## Paso 1: Crear capa de animación base

```txt
/client/animation/
  animationEvents.ts
  animationVariants.ts
  useReducedMotionSafe.ts
```

## Paso 2: Animar cartas con Motion

```txt
- Hover
- Select
- Reveal
- Enter
- Exit
```

## Paso 3: Animar cambios de turno

```txt
- Banner de turno
- Glow del jugador activo
- Atenuación de jugadores inactivos
```

## Paso 4: Crear eventos visuales

```txt
- card_drawn
- card_played
- card_exploded
- player_absent
- table_activated
```

## Paso 5: Agregar sonidos opcionales

```txt
- click
- draw
- reveal
- explosion
- turn
```

## Paso 6: Agregar GSAP solo para secuencias importantes

```txt
- Explosión de carta
- Final de ronda
- Victoria
```

---

## 16. Resumen ejecutivo

El juego debe mantener esta separación:

```txt
boardgame.io = reglas y estado
React = render visual
Motion = animaciones normales
bgio-effects = eventos visuales efímeros
GSAP = secuencias premium
Howler = sonido
```

Esta arquitectura permite lograr una UI fluida y de primer nivel sin comprometer la estabilidad del multiplayer.

La prioridad debe ser terminar un MVP funcional y limpio, pero dejando una base preparada para animaciones premium después.

