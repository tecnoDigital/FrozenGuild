# Frozen Guild - Release Candidate (Etapa 22)

## Objetivo

Cerrar release candidate con evidencia.

## Criterios obligatorios

- [ ] 5 partidas completas sin intervencion tecnica.
- [ ] 0 bugs bloqueantes abiertos.
- [ ] Backup + restore de SQLite probado.
- [ ] Reglas MVP congeladas (sin cambios funcionales).

## Registro de partidas (5/5)

| # | Fecha | MatchID | Jugadores | Resultado | Observaciones |
|---|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |

## Registro de bugs bloqueantes

| ID | Titulo | Estado | Fecha cierre | Nota |
|---|---|---|---|---|
|  |  |  |  |  |

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

- [ ] Go RC
- [ ] No-Go RC

Firma responsable:

- Fecha:
- Nombre:
- Decision:
