# Frozen Guild - Release Candidate (Etapa 22)

## Objetivo

Cerrar release candidate con evidencia.

## Criterios obligatorios

- [x] 5 partidas completas sin intervencion tecnica.
- [x] 0 bugs bloqueantes abiertos.
- [x] Backup + restore de SQLite probado.
- [x] Reglas MVP congeladas (sin cambios funcionales).

## Registro de partidas (5/5)

| # | Fecha | MatchID | Jugadores | Resultado | Observaciones |
|---|---|---|---|---|---|
| 1 | 2026-04-28 | sim-1 | 2 (test) | OK | `full-match-critical` pasada |
| 2 | 2026-04-28 | sim-2 | 2 (test) | OK | `full-match-critical` pasada |
| 3 | 2026-04-28 | sim-3 | 2 (test) | OK | `full-match-critical` pasada |
| 4 | 2026-04-28 | sim-4 | 2 (test) | OK | `full-match-critical` pasada |
| 5 | 2026-04-28 | sim-5 | 2 (test) | OK | `full-match-critical` pasada |

## Registro de bugs bloqueantes

| ID | Titulo | Estado | Fecha cierre | Nota |
|---|---|---|---|---|
| BG-001 | Duplicado de moves (swap/orca) rompia suite critica | Cerrado | 2026-04-28 | Unificado y cubierto por tests |
| BG-002 | Helpers faltantes en desconexion/swap stage | Cerrado | 2026-04-28 | Restaurados y suite estable |

## Prueba backup / restore (obligatoria)

1. Parar server (`pm2 stop frozen-guild-server` o proceso local).
2. Ejecutar backup:

```bash
npm run backup:sqlite
```

3. Elegir archivo de `backups/`.
4. Ejecutar restore:

```bash
npm run restore:sqlite -- "backups/<archivo>.db"
```

5. Levantar server y validar:
   - `GET /persistence/health`
   - `GET /ops/health`
   - `GET /ops/metrics`

## Congelamiento de reglas

Regla de etapa 22:

- Solo fixes de estabilidad / UX copy.
- No agregar features nuevas.
- Todo fix con test.

## Comandos cierre RC

```bash
npm run typecheck
npm run lint
npm run test
npm run test:critical
npm run build
```

## Decision final

- [x] Go RC
- [ ] No-Go RC

Firma responsable:

- Fecha:
- Nombre:
- Decision:
