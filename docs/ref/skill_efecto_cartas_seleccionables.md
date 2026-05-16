# Skill: Efecto de brillo para cartas seleccionables

## Objetivo

Crear un estado visual claro para cartas o slots que pueden ser seleccionados por el jugador.

Este efecto debe comunicar:

- Esta carta sí se puede tocar.
- Esta carta pertenece a la acción actual.
- El jugador debe elegir una de estas opciones para continuar.

No debe usarse como decoración permanente. Solo aparece cuando la carta es una opción válida.

---

## Cuándo usarlo

Úsalo cuando una carta o slot tenga `selectable === true`.

Ejemplos:

- Pesca activa: slots válidos de El Hielo.
- Espionaje: cartas que se pueden mirar.
- Intercambio: cartas que pueden ser objetivo.
- Orca/Foca-Bomba: cartas propias que pueden destruirse o descartarse.

No lo uses para:

- Cartas bloqueadas.
- Cartas de puro display.
- Cartas no válidas para la acción actual.
- Cartas seleccionadas definitivamente, porque ese estado debe tener otro tratamiento.

---

## Regla UX

La carta seleccionable debe sentirse como una opción viva, no como un botón genérico.

La estructura visual ideal es:

```txt
Carta normal
↓
Acción activa
↓
Carta válida recibe borde luminoso + glow + sweep
↓
Hover levanta la carta ligeramente
↓
Click confirma selección
```

---

## Contrato de componente

El componente debe recibir una propiedad booleana:

```tsx
selectable: boolean;
```

Ejemplo:

```tsx
<Card
  selectable={canFish && !slot.empty}
  onClick={() => fishFromIce(slot.slotIndex)}
/>
```

La clase visual debe aplicarse solo cuando `selectable` sea verdadero:

```tsx
className={cx("ice-card", selectable && "selectable")}
```

---

## Implementación React recomendada

```tsx
function IceCard({ selectable, empty, onClick, index }) {
  return (
    <motion.button
      type="button"
      className={cx("ice-card", selectable && "selectable", empty && "empty")}
      disabled={!selectable}
      onClick={onClick}
      whileHover={selectable ? { y: -8, scale: 1.04 } : undefined}
      whileTap={selectable ? { scale: 0.96 } : undefined}
      layout
      aria-label={empty ? `Slot ${index + 1} vacío` : `Seleccionar carta del slot ${index + 1}`}
    >
      {!empty ? (
        <>
          <div className="card-back-glow" />
          <span className="slot-number">{index + 1}</span>
          {selectable && <span className="select-chip">Elegir</span>}
        </>
      ) : (
        <span className="empty-label">Vacío</span>
      )}
    </motion.button>
  );
}
```

---

## CSS base de carta

```css
.ice-card {
  position: relative;
  aspect-ratio: 0.72;
  border-radius: 11px;
  overflow: hidden;
  border: 1px solid rgba(154, 217, 255, 0.34);
  background: linear-gradient(150deg, #12345a, #06172b 60%, #020810);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.38),
    inset 0 0 22px rgba(119, 213, 255, 0.12);
  color: white;
}
```

---

## Glow interno de la carta

Este glow le da profundidad a la carta incluso antes de ser seleccionable.

```css
.card-back-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(124, 238, 255, 0.16),
    transparent 60%
  );
}
```

---

## Estado seleccionable

Esta es la parte más importante del efecto.

```css
.ice-card.selectable {
  border-color: rgba(126, 239, 255, 0.78);
  box-shadow:
    0 0 0 2px rgba(124, 238, 255, 0.22),
    0 0 32px rgba(124, 238, 255, 0.28),
    0 16px 30px rgba(0, 0, 0, 0.4);
}
```

Qué hace cada capa:

```txt
0 0 0 2px rgba(...)      → contorno externo limpio
0 0 32px rgba(...)       → aura fría alrededor de la carta
0 16px 30px rgba(...)    → sombra de elevación
```

---

## Sweep animado

El sweep crea el brillo que recorre la carta.

```css
.ice-card.selectable::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  animation: sweep 1.25s linear infinite;
}
```

```css
@keyframes sweep {
  from {
    transform: translateX(-130%) skewX(-16deg);
  }

  to {
    transform: translateX(130%) skewX(-16deg);
  }
}
```

---

## Chip de acción

El chip debe aparecer solo si la carta es seleccionable.

```tsx
{selectable && <span className="select-chip">Elegir</span>}
```

```css
.select-chip {
  position: absolute;
  left: 50%;
  bottom: 7px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #8eefff, #6f8dff);
  color: #02111d;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
  z-index: 2;
}
```

Para Pesca puedes cambiar el texto a:

```tsx
{selectable && <span className="select-chip">Pescar</span>}
```

---

## Hover y tap con Framer Motion

```tsx
whileHover={selectable ? { y: -8, scale: 1.04 } : undefined}
whileTap={selectable ? { scale: 0.96 } : undefined}
```

Regla:

- Hover solo si `selectable === true`.
- Tap solo si `selectable === true`.
- No animar cartas bloqueadas.

Esto evita que el jugador crea que puede tocar cartas inválidas.

---

## Versión sin Framer Motion

Si el agente no quiere usar Motion, usar CSS puro:

```css
.ice-card.selectable {
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

.ice-card.selectable:hover {
  transform: translateY(-8px) scale(1.04);
}

.ice-card.selectable:active {
  transform: translateY(-4px) scale(0.96);
}
```

---

## Estados que no deben mezclarse

No uses la misma clase para todo.

Mal:

```tsx
className="card active"
```

Mejor:

```tsx
className={cx(
  "ice-card",
  selectable && "selectable",
  selected && "selected",
  disabled && "disabled"
)}
```

Diferencia recomendada:

```txt
selectable → puede elegirse ahora
selected   → ya fue elegida
disabled   → existe pero no puede tocarse
empty      → no hay carta
```

---

## Variante para carta ya seleccionada

El efecto de seleccionada debe ser más estable y menos animado.

```css
.ice-card.selected {
  border-color: rgba(255, 244, 166, 0.95);
  box-shadow:
    0 0 0 2px rgba(255, 244, 166, 0.32),
    0 0 28px rgba(255, 232, 105, 0.32);
}

.ice-card.selected::after {
  animation: none;
  background: transparent;
}
```

---

## Checklist de aceptación

El efecto está bien implementado si:

- Solo aparece en cartas válidas para la acción actual.
- La carta brilla sin tapar su contenido.
- El hover solo ocurre en cartas seleccionables.
- El botón está deshabilitado cuando no se puede seleccionar.
- El chip de acción aparece solo cuando corresponde.
- El sweep no se usa en todas las cartas al mismo tiempo sin razón.
- El estado seleccionado tiene un estilo diferente al estado seleccionable.

---

## Prompt corto para el agente

```txt
Implementa el efecto de carta seleccionable.

Cuando una carta o slot tenga selectable=true:
- Agrega clase .selectable.
- Aplica borde cyan brillante.
- Agrega glow exterior con box-shadow.
- Agrega sweep animado con ::after.
- Permite hover/tap solo si selectable=true.
- Muestra un chip pequeño de acción, por ejemplo “Pescar” o “Elegir”.

No apliques este efecto a cartas bloqueadas, vacías o no válidas.
No uses el mismo estilo para selected y selectable.
El objetivo es que el jugador entienda inmediatamente qué cartas puede tocar.
```

---

## Código mínimo reusable

```tsx
function SelectableCard({ selectable, selected, disabled, children, onClick }) {
  return (
    <button
      type="button"
      className={cx(
        "selectable-card",
        selectable && "selectable",
        selected && "selected",
        disabled && "disabled"
      )}
      disabled={!selectable || disabled}
      onClick={onClick}
    >
      {children}
      {selectable && <span className="select-chip">Elegir</span>}
    </button>
  );
}
```

```css
.selectable-card {
  position: relative;
  overflow: hidden;
  border-radius: 11px;
  border: 1px solid rgba(154, 217, 255, 0.34);
  background: linear-gradient(150deg, #12345a, #06172b 60%, #020810);
}

.selectable-card.selectable {
  cursor: pointer;
  border-color: rgba(126, 239, 255, 0.78);
  box-shadow:
    0 0 0 2px rgba(124, 238, 255, 0.22),
    0 0 32px rgba(124, 238, 255, 0.28),
    0 16px 30px rgba(0, 0, 0, 0.4);
}

.selectable-card.selectable::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  animation: sweep 1.25s linear infinite;
}

.selectable-card.selected {
  border-color: rgba(255, 244, 166, 0.95);
  box-shadow:
    0 0 0 2px rgba(255, 244, 166, 0.32),
    0 0 28px rgba(255, 232, 105, 0.32);
}

.selectable-card.selected::after {
  animation: none;
  background: transparent;
}

.select-chip {
  position: absolute;
  left: 50%;
  bottom: 7px;
  transform: translateX(-50%);
  z-index: 2;
  padding: 4px 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #8eefff, #6f8dff);
  color: #02111d;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
}

@keyframes sweep {
  from {
    transform: translateX(-130%) skewX(-16deg);
  }

  to {
    transform: translateX(130%) skewX(-16deg);
  }
}
```

