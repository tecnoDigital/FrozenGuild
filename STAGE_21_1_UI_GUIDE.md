# Frozen Guild - Guia Etapa 21.1 (UI)

## Objetivo

Cerrar UI MVP para demo.
Mostrar estado de conexion claro.
Mostrar mesa activa/pausada claro.
No tocar reglas core sin test.

## Lo que ya esta listo (backend y estado)

- `players[playerID].connectionStatus`: `connected | reconnecting | absent`
- `players[playerID].disconnectStartedAt`
- `activeTable: boolean`
- `autoResolveQueue`
- Moves listos:
  - `markPlayerDisconnected(nowMs?)`
  - `markPlayerReconnected()`
  - `processAutoResolve(nowMs?)`
  - `setTableActive(active)`
- Endpoints de soporte:
  - `GET /ops/health`
  - `GET /ops/metrics`
  - `GET /persistence/health`

## Contrato UI minimo (21.1)

UI debe leer y pintar:

- Estado mesa: `G.activeTable`
- Estado jugador por fila: `player.connectionStatus`
- Cola de auto-resolve: `G.autoResolveQueue.length`
- Turno actual: `ctx.currentPlayer`
- Accion bloqueada por pausa: botones disabled

UI no debe:

- Inventar timers cliente como verdad final.
- Forzar estado local sin move del server.
- Mostrar datos ocultos del hielo real.

## Pantallas y bloques a cerrar

### 1) Lobby

- Estado conexion global del cliente: conectando/conectado/desconectado.
- Boton reintento visible si socket cae.
- MatchID y playerID siempre visibles.

### 2) Game Header

- Badge fuerte: `Mesa activa` o `Mesa pausada`.
- Si pausada: banner bloqueante arriba.
- Mostrar turno actual con destaque.

### 3) Lista de jugadores

- Badge por jugador:
  - verde: `connected`
  - amarillo: `reconnecting`
  - rojo: `absent`
- Si `reconnecting`: mostrar contador visual estimado (30s) con nota "estimado".

### 4) Panel de accion

- Si mesa pausada: todo disabled.
- Si no es tu turno: todo disabled.
- Mensaje exacto de por que esta bloqueado.

### 5) Debug panel (solo dev)

- Botones:
  - simular desconexion
  - simular reconexion
  - pausar mesa
  - activar mesa
  - correr selftest
- Ocultar en produccion con flag.

## UX copy recomendado (simple)

- Mesa pausada: "Mesa en pausa. No corren timers."
- Reconnecting: "Reconectando. Esperando hasta 30s."
- Absent: "Ausente. El turno se salta automaticamente."
- Bloqueo accion: "Accion bloqueada por estado de mesa o turno."

## Plan de implementacion 21.1 (paso corto)

1. Ajustar layout header + banner mesa.
2. Unificar componente `ConnectionBadge`.
3. Unificar `disabledReason` en botones.
4. Limpiar panel debug con flag dev.
5. Agregar tests UI basicos (render estados).
6. Smoke test manual en 2 navegadores.

## Criterio de cierre 21.1

Se considera listo solo si:

- Jugador entiende en 3 segundos:
  - de quien es turno
  - si mesa esta activa/pausada
  - quien esta reconnecting/absent
- No hay botones "clickeables" invalidos.
- Flujo 2 navegadores estable 10 minutos.
- Sin fuga de info oculta.

## Checklist QA rapido

- [ ] Pausar mesa bloquea acciones.
- [ ] Activar mesa restablece acciones validas.
- [ ] Reconnecting cambia a absent tras timeout server.
- [ ] Turno absent se salta si hay otro conectado.
- [ ] Si todos ausentes, mesa queda pausada.
- [ ] Selftest no muestra FAIL en flujo normal.

## Comandos utiles

```bash
npm run dev
npm run test
npm run test:critical
npm run lint
npm run typecheck
```

## Riesgos de 21.1

- Sobre-disenar UI y romper claridad.
- Duplicar logica de reglas en cliente.
- Mensajes ambiguos en estados bloqueados.

Regla final:
UI explica estado.
Server decide estado.
