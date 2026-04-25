Frozen Guild \- MVP Final 

**Frozen Guild** 

Documento Final del Proyecto \- MVP Web 1-4 Jugadores 

**Decision clave actualizada** 

La Orca permite elegir que carta destruir al momento de recibirla. La eleccion ocurre en una  resolucion obligatoria controlada por servidor: la Orca se descarta y el jugador elige una carta de su  propia zona para destruir antes de continuar el turno.

| Campo  | Definicion |
| :---- | :---- |
| Version  | MVP Final v1.1 |
| Stack  | Node.js \+ boardgame.io \+ React/Vite \+ SQLite \+ Nginx \+  PM2 |
| Infraestructura objetivo  | VPS 1GB-2GB RAM |
| Jugadores  | 1-4 jugadores |
| Mesas activas objetivo  | 1-2 mesas simultaneas |
| Principio rector  | Una cosa a la vez; sin arquitectura para un futuro que  no existe |

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final   
**Indice ejecutivo** 

1\. Resumen ejecutivo 

2\. Alcance del MVP 

3\. Reglas finales de producto 

4\. Flujo de turno y resolucion de Orca 5\. Arquitectura tecnica 

6\. Modelo de estado y vistas 

7\. Moves oficiales y validaciones 8\. Estructura del proyecto 

9\. Metodologia de trabajo 

10\. Roadmap por bloques de 4 semanas 11\. Infraestructura VPS 1GB-2GB 12\. Persistencia y backup 

13\. Frontend, cartas y tablero dinamico 14\. Testing y calidad 

15\. Checklist de lanzamiento 

16\. Riesgos y decisiones pendientes 17\. Veredicto y siguiente paso

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final   
**1\. Resumen ejecutivo** 

Frozen Guild es una version digital web de un juego de cartas por turnos, basado en coleccion de sets,  memoria, azar controlado y confrontacion directa. 

El juego usa un tablero central llamado El Hielo, formado por una cuadricula de 3x3 cartas boca abajo.  Los jugadores toman, miran, regalan o intercambian cartas usando el resultado de un dado de 6 caras. 

La version final elimina la mecanica de reroll para reducir ramas de estado, acelerar turnos y facilitar el  desarrollo sobre una VPS pequena. 

**Resumen de viabilidad** 

El MVP es viable para 1-4 jugadores y 1-2 mesas activas en una VPS de 1GB-2GB si se mantiene el  alcance estricto: sin chat, sin ranking, sin bots, sin 8 jugadores, sin Redis y sin modos alternativos. 

**2\. Alcance del MVP** 

**2.1 MVP obligatorio** 

 Crear partida y unirse como jugador. 

 Soportar 1-4 jugadores. 

 Crear El Hielo: tablero 3x3 con 9 cartas boca abajo. 

 Repartir cartas iniciales. 

 Lanzar dado una sola vez por turno. 

 Ejecutar accion segun resultado del dado. 

 Resolver Pesca, Espionaje, Intercambio y El Padrino. 

 Resolver Orca con seleccion obligatoria de carta a destruir. 

 Resolver Foca-Bomba con stage obligatorio cuando aplique. 

 Cerrar partida cuando no se pueda rellenar El Hielo. 

 Calcular puntuacion final. 

 Persistir estado con SQLite. 

 Desplegar en VPS con Nginx y PM2. 

**2.2 Fuera del MVP** 

 8 jugadores. 

 Chat. 

 Ranking. 

 Login con Google. 

 Tienda. 

 Skins. 

 Bots. 

 Espectadores. 

 Replay. 

 Modo competitivo.

Documento de ejecucion tecnica y producto \- Version PDF 

 Expansiones. 

 App movil. 

 Sistema de amigos.  Torneos. 

 Cluster. 

 Redis. 

**Regla de decision**   
Frozen Guild \- MVP Final 

Si una funcion no ayuda a jugar una partida completa de Frozen Guild, no entra al MVP. 

**3\. Reglas finales de producto** 

**3.1 Nombre y alcance** 

El proyecto se llama Frozen Guild. Cualquier referencia a Arctic Mafia queda como antecedente historico  o material base, no como naming de producto. 

| Concepto  | Decision final |
| :---- | :---- |
| Jugadores  | Minimo 1 para pruebas; recomendado 2-4 para juego real. |
| Tablero  | El Hielo: 9 cartas boca abajo en cuadricula 3x3. |
| Dado  | Un solo lanzamiento por turno; no existe reroll. |
| Servidor  | Autoritativo. El cliente solo solicita acciones. |
| Informacion oculta  | Filtrada con playerView; el cliente no recibe IDs de cartas  ocultas. |

**3.2 Cartas y efectos**

| Carta  | Funcion en MVP |
| :---- | :---- |
| Pinguino  | Puntuacion estable. Suma 1, 2 o 3 pescados segun valor. |
| Morsa  | Multiplicador x2 sobre un pinguino. Limite: 1 morsa por  pinguino. |
| Petrel  | Valor variable al final: cantidad par suma; cantidad impar  castiga. |
| Elefante Marino  | Puntuacion exponencial N^2. |
| Krill  | Comparacion final de mayorias: mas Krill gana bono;  menos o cero recibe castigo. |
| Orca  | Efecto inmediato al recibirla: el jugador elige una carta  propia para destruir; la Orca tambien se destruye. |
| Foca-Bomba  | Si el jugador inicia y termina su turno con ella, explota y  obliga a descartar cartas. |

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

**4\. Flujo de turno y resolucion de Orca** 

**4.1 Flujo oficial sin reroll** 

1\. Inicia el turno. 

2\. El servidor revisa si el jugador empezo con Foca-Bomba. 

3\. El jugador lanza el dado. 

4\. El servidor guarda el resultado. 

5\. El jugador ejecuta la accion obligatoria. 

6\. El servidor valida que la accion corresponda al dado. 

7\. Se resuelven efectos inmediatos. 

8\. Si entra Orca, el jugador elige la carta que destruira. 

9\. Se revisa Foca-Bomba al final del turno. 

10\. Termina turno y avanza al siguiente jugador. 

**4.2 Acciones del dado** 

| Dado  | Accion |
| :---- | :---- |
| 1, 2 o 3  | Pesca: tomar una carta de El Hielo y reponer el hueco desde el mazo. |
| 4  | Espionaje: mirar en secreto 3 cartas de El Hielo;  opcionalmente regalar una a un rival. |
| 5  | Intercambio: cambiar una carta entre dos zonas  cualesquiera. |
| 6  | El Padrino: elegir una accion del 1 al 5\. |

**4.3 Regla final de Orca** 

**Regla final** 

Cuando un jugador recibe una Orca, se activa inmediatamente una resolucion obligatoria. El jugador  elige una carta de su propia zona para destruir. Al resolver, la Orca tambien se destruye. La partida  no continua hasta resolver este efecto. 

La Orca puede llegar a la zona del jugador por Pesca, Espionaje como regalo o Intercambio. En cualquiera de esos casos, el efecto se dispara al momento de recibirla. 

Si la zona del jugador no tiene otra carta destruible ademas de la Orca, la Orca se descarta sola y el turno  continua. Si hay al menos una carta adicional, el jugador debe elegir una carta objetivo. 

La carta elegida puede ser negativa o positiva. Esto permite usar la Orca como herramienta de limpieza,  por ejemplo para destruir una Foca-Bomba antes de que explote.

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

**4.4 Implementacion correcta de Orca** 

La Orca no debe resolverse en el cliente. El cliente solo muestra la seleccion posible. La validacion y  destruccion ocurren en servidor. 

La implementacion recomendada usa un stage bloqueante de boardgame.io:  ORCA\_DESTROY\_SELECTION. 

// Al recibir una carta en la zona del jugador: 

function addCardToZone(G, playerID, cardID) { 

 G.players\[playerID\].zone.push(cardID); 

 const card \= getCard(cardID); 

 if (card.type \=== 'orca') { 

 G.pendingStage \= { 

 type: 'ORCA\_DESTROY\_SELECTION', 

 playerID, 

 orcaCardID: cardID, 

 validTargets: getDestroyableCards(G, playerID, cardID) 

 }; 

 } 

} 

// Resolucion obligatoria: 

function resolveOrcaDestroy(G, playerID, targetCardID) { 

 assertPendingStage(G, 'ORCA\_DESTROY\_SELECTION', playerID); 

 assertCardInPlayerZone(G, playerID, targetCardID); 

 const { orcaCardID } \= G.pendingStage; 

 removeFromZone(G, playerID, orcaCardID); 

 moveToDiscard(G, orcaCardID); 

 if (targetCardID \!== orcaCardID) { 

 removeFromZone(G, playerID, targetCardID); 

 moveToDiscard(G, targetCardID); 

 } 

 G.pendingStage \= null; 

} 

**4.5 Flujo Mermaid simplificado** 

graph TD 

 A\[Inicio del Turno\] \--\> B\[Check Foca-Bomba\] 

 B \--\> C\[Lanzar Dado\] 

 C \--\> D\[Resultado Unico\] 

 D \--\> E{Accion Obligatoria} 

 E \-- 1,2,3 \--\> F\[Pesca\] 

 E \-- 4 \--\> G\[Espionaje\] 

 E \-- 5 \--\> H\[Intercambio\] 

 E \-- 6 \--\> I\[El Padrino\] 

 F \--\> J\[Recibir Carta\] 

 G \--\> J 

 H \--\> J

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

 I \--\> J 

 J \--\> K{Recibio Orca?} 

 K \-- Si \--\> L\[Elegir carta propia a destruir\]  L \--\> M\[Descartar Orca \+ carta elegida\]  K \-- No \--\> N\[Continuar\] 

 M \--\> N 

 N \--\> O{Foca-Bomba activa?} 

 O \-- Si \--\> P\[Resolver explosion\]  O \-- No \--\> Q\[Fin de Turno\] 

 P \--\> Q

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final   
**5\. Arquitectura tecnica** 

Frozen Guild usara una arquitectura simple y autoritativa: React renderiza, boardgame.io controla el  juego, Node ejecuta el server, SQLite persiste y Nginx expone el frontend y los WebSockets. 

| Capa  | Tecnologia  | Motivo |
| :---- | :---- | :---- |
| Frontend  | React \+ Vite  | Rapido, simple, build estatico. |
| Animaciones  | CSS; Motion opcional  | Flip de cartas y transiciones ligeras. |
| Motor de juego  | boardgame.io  | Turnos, moves, stages, multiplayer y  playerView. |
| Backend  | Node.js  | Mismo lenguaje para reglas, server y  tooling. |
| Persistencia  | SQLite WAL  | Suficiente para una VPS y 1-2 mesas  activas. |
| Reverse proxy  | Nginx  | Sirve frontend y proxy WebSocket. |
| Proceso  | PM2  | Mantiene server vivo y reinicia por  memoria. |

Usuario 

 \-\> Navegador React/Vite 

 \-\> HTTPS / WebSocket 

 \-\> Nginx 

 \-\> Node.js \+ boardgame.io 

 \-\> SQLite WAL 

**6\. Modelo de estado y vistas** 

**6.1 Estado autoritativo G** 

type GameState \= { 

 deck: CardId\[\]; 

 discardPile: CardId\[\]; 

 secret: { 

 iceGrid: CardId\[\]; // 9 cartas reales, ocultas al cliente 

 }; 

 iceGridPublic: IceSlotView\[\]; 

 dice: { 

 value: number | null; 

 rolled: boolean; 

 }; 

 players: Record\<PlayerID, PlayerState\>;

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

 pendingStage: null | { 

 type: 

 | 'ORCA\_DESTROY\_SELECTION' 

 | 'SEAL\_EXPLOSION' 

 | 'SPY\_CHOOSE' 

 | 'PADRINO\_CHOOSE'; 

 playerID: PlayerID; 

 validTargets?: CardId\[\]; 

 orcaCardID?: CardId; 

 }; 

 turnLog: PublicLogEntry\[\]; 

}; 

**6.2 Estado de jugador** 

type PlayerState \= { 

 name: string; 

 zone: CardId\[\]; 

 hasBombAtStart: boolean; 

}; 

**6.3 Cartas** 

type Card \= { 

 id: string; 

 type: 

 | 'penguin' 

 | 'walrus' 

 | 'petrel' 

 | 'sea\_elephant' 

 | 'krill' 

 | 'orca' 

 | 'seal\_bomb' 

 | 'mountain'; 

 value?: number; 

 image: string; 

}; 

**6.4 Informacion publica y privada**

| Dato  | Publico  | Privado / filtrado |
| :---- | :---- | :---- |
| El Hielo  | Slots y estado hidden  | CardId real solo si el jugador puede  verlo por Espionaje. |
| Mazo  | Cantidad restante  | Orden real e IDs de cartas ocultos. |
| Zonas de jugador  | Cartas boca arriba en zona  | No aplica si todas las zonas son  visibles. |
| Dado  | Resultado del turno  | No aplica. |
| Pending stage  | Mensaje general de bloqueo  | Targets validos solo para el jugador  que resuelve. |

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

**7\. Moves oficiales y validaciones** 

| Move  | Proposito  | Validaciones |
| :---- | :---- | :---- |
| rollDice()  | Generar resultado unico del turno.  | Jugador activo; no se ha tirado dado; no  hay stage pendiente. |
| fishFromIce(slot)  | Tomar carta del Hielo.  | Dado 1-3 o Padrino; slot ocupado;  reponer si hay mazo. |
| spyCards(slots)  | Mirar 3 cartas en secreto.  | Dado 4; slots unicos; maximo 3\. |
| spyGiveCard(slot, targetPlayerID)  | Regalar carta vista a rival.  | Stage de espionaje; target valido; reponer  slot. |
| swapCards(...)  | Intercambiar cartas entre zonas.  | Dado 5; cartas existen; zonas validas. |
| choosePadrinoAction(action)  | Elegir accion 1-5.  | Dado 6; accion valida; no se ha usado. |
| resolveOrcaDestroy(cardID)  | Elegir carta que destruye Orca.  | Stage ORCA\_DESTROY\_SELECTION; carta  en zona propia; target valido. |
| resolveSealExplosion(cardIDs)  | Resolver explosion de Foca.  | Stage SEAL\_EXPLOSION; cartas propias;  cantidad requerida. |
| endTurn()  | Cerrar turno.  | No hay stage pendiente; accion   obligatoria resuelta. |

**8\. Estructura del proyecto** 

frozen-guild/ 

├─ web/ 

│ ├─ src/ 

│ │ ├─ assets/cards/ 

│ │ ├─ components/ 

│ │ │ ├─ Card.tsx 

│ │ │ ├─ IceGrid.tsx 

│ │ │ ├─ PlayerZone.tsx 

│ │ │ ├─ DicePanel.tsx 

│ │ │ └─ ActionPanel.tsx 

│ │ ├─ screens/ 

│ │ │ ├─ LobbyScreen.tsx 

│ │ │ └─ GameScreen.tsx 

│ │ ├─ boardgame/client.ts 

│ │ └─ main.tsx 

│ 

├─ server/ 

│ ├─ index.ts 

│ ├─ storage.ts 

│ └─ config.ts 

│ 

├─ shared/game/ 

│ ├─ FrozenGuild.ts 

│ ├─ cards.ts 

│ ├─ deck.ts 

│ ├─ setup.ts

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

│ ├─ moves.ts 

│ ├─ effects.ts 

│ ├─ scoring.ts 

│ ├─ playerView.ts 

│ └─ types.ts 

│ 

├─ tests/ 

│ ├─ rules/ 

│ ├─ scoring/ 

│ └─ e2e/ 

├─ ecosystem.config.js 

├─ package.json 

└─ README.md 

**9\. Metodologia de trabajo** 

**Principio rector** 

Primero que funcione. Luego que sea claro. Luego que sea bonito. Luego que sea robusto. Nunca al  reves. 

 Trabajar en bloques de 4 semanas. 

 Cada bloque debe cerrar con algo jugable, medible o deployable. 

 No avanzar si los KPIs del bloque anterior no estan cumplidos. 

 No crear sistemas genericos antes de necesitarlos. 

 No duplicar logica entre frontend y backend. 

 No validar reglas importantes en cliente. 
Sí. Yo cambiaría la **sección 10** porque ahorita está demasiado “macro”: 4 bloques de 4 semanas, buenos para dirección, pero flojos para ejecución diaria. El documento actual ya define esos bloques y KPIs generales, así que lo mejor es conservarlos como marco y bajar debajo una tabla de etapas tipo sprint. 

Te lo dejaría así:

---

## 10. Roadmap por etapas esperadas


| Etapa                             | Logros por conseguir                                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Etapa 1 · Base del proyecto       | Repo funcional, TypeScript configurado, estructura `web/`, `server/`, `shared/game/`, scripts base, lint/formato inicial, primer arranque local |
| Etapa 2 · Modelo de cartas        | Definir `cards.ts`, tipos de carta, valores, IDs, imágenes placeholder, mazo completo y descarte                                                |
| Etapa 3 · Setup de partida        | Crear partida local, generar mazo, barajar, crear El Hielo 3x3, repartir cartas iniciales y preparar estado inicial                             |
| Etapa 4 · Turno básico            | Jugador activo, avance de turno, dado de un solo lanzamiento, bloqueo para impedir acciones fuera de turno                                      |
| Etapa 5 · Pesca                   | Tomar carta de El Hielo con dado 1-3, agregarla a zona del jugador, reponer hueco desde mazo y validar fin de partida si no se puede reponer    |
| Etapa 6 · Scoring base            | Calcular puntos de Pingüino, Morsa, Petrel, Elefante Marino y Krill; mostrar resultado final básico                                             |
| Etapa 7 · UI mínima local         | Pantalla de partida, El Hielo 3x3, zona de jugadores, dado, panel de acción y mensajes claros de estado                                         |
| Etapa 8 · Multiplayer base        | Crear/unirse a partida desde varios navegadores, manejar `playerID`, credentials y estado visible por jugador                                   |
| Etapa 9 · PlayerView seguro       | Filtrar cartas ocultas, evitar fuga de IDs reales de El Hielo, mostrar solo `hidden: true` cuando corresponda                                   |
| Etapa 10 · Espionaje              | Mirar hasta 3 cartas en secreto, mostrar información solo al jugador activo, permitir regalar carta vista a rival                               |
| Etapa 11 · Intercambio            | Intercambiar cartas entre zonas válidas, actualizar orden estable de zonas y validar que no existan intercambios ilegales                       |
| Etapa 12 · El Padrino             | Con dado 6, elegir una acción del 1 al 5, bloquear doble uso y reutilizar validaciones existentes                                               |
| Etapa 13 · Orca                   | Detectar Orca al recibirla, abrir stage obligatorio, destruir Orca y carta elegida, impedir terminar turno con Orca pendiente                   |
| Etapa 14 · Foca-Bomba             | Detectar si el jugador inició y terminó turno con Foca-Bomba, abrir stage obligatorio y resolver explosión                                      |
| Etapa 15 · Desconexión y ausencia | Contador de 30 segundos, estado `connected/reconnecting/absent`, auto-resolve mínimo de Orca/Foca, auto-skip de turnos ausentes                 |
| Etapa 16 · Mesas activas y pausa  | `MAX_ACTIVE_TABLES`, una mesa activa por defecto, mesas extra pausadas, timers solo en mesas activas                                            |
| Etapa 17 · Persistencia SQLite    | Guardar partidas, jugadores, estado serializado, resumen final, SQLite WAL y consulta de último estado                                          |
| Etapa 18 · VPS y producción       | Build de Vite, Node detrás de Nginx, WebSocket estable, PM2 con restart por memoria, variables de entorno                                       |
| Etapa 19 · Observabilidad mínima  | Logs de partida, errores de moves, estado de mesa, memoria del proceso, mesas activas/pausadas                                                  |
| Etapa 20 · Testing crítico        | Tests de deck, setup, scoring, Orca, Foca-Bomba, playerView, desconexión y partida completa                                                     |
| Etapa 21 · Pulido MVP             | UI limpia, mensajes entendibles, pantalla final, placeholders consistentes, documentación mínima de instalación                                 |
| Etapa 22 · Release candidate      | 5 partidas completas sin intervención, 0 bugs bloqueantes, backup/restore probado y reglas congeladas                                           |

---

## 10.1 Orden recomendado por bloques

| Bloque                                    | Etapas incluidas | Resultado esperado                                                                          |
| ----------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Bloque 1 · Núcleo jugable local           | Etapas 1-7       | Frozen Guild corre en local y permite jugar una partida básica con Pesca y scoring          |
| Bloque 2 · Multiplayer y reglas completas | Etapas 8-16      | Partida 1-4 jugadores con Espionaje, Intercambio, Padrino, Orca, Foca-Bomba y desconexiones |
| Bloque 3 · Persistencia y VPS             | Etapas 17-19     | Partidas persistidas, despliegue real en VPS, PM2, Nginx, WebSocket y logs mínimos          |
| Bloque 4 · Calidad y release              | Etapas 20-22     | MVP probado, presentable y listo para demo cerrada                                          |

---

## 10.2 Regla de avance entre etapas

Una etapa no se considera terminada si solo “compila”.
Debe cumplir al menos una de estas condiciones:

| Tipo de etapa       | Criterio de cierre                                           |
| ------------------- | ------------------------------------------------------------ |
| Regla de juego      | Tiene test y se puede ejecutar desde una partida local       |
| UI                  | El usuario entiende qué hacer sin explicación verbal         |
| Multiplayer         | Funciona desde dos navegadores distintos                     |
| Seguridad de estado | El cliente no recibe información que no debería ver          |
| Persistencia        | Se puede cerrar y recuperar una partida                      |
| Producción          | Corre en VPS sin depender de Vite dev server                 |
| Release             | Se puede jugar una partida completa sin intervención técnica |


**11\. Infraestructura VPS 1GB-2GB** 

La VPS debe reservar la mayor parte de RAM para Node. El frontend se sirve como estatico desde Nginx;  no se corre Vite en produccion. 

**11.1 PM2** 

module.exports \= { 

 apps: \[{ 

 name: 'frozen-guild-server', 

 script: './server/dist/index.js', 

 instances: 1, 

 exec\_mode: 'fork', 

 max\_memory\_restart: '400M', 

 exp\_backoff\_restart\_delay: 100, 

 env: { 

 NODE\_ENV: 'production', 

 PORT: 8000 

 } 

 }\] 

}; 

**11.2 Nginx** 

server { 

 listen 80; 

 server\_name frozen.example.com; 

 root /var/www/frozen-guild/web/dist; 

 index index.html; 

 location / { 

 try\_files $uri /index.html; 

 } 

 location /games/ {

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

 proxy\_pass http://127.0.0.1:8000/games/; 

 proxy\_http\_version 1.1; 

 proxy\_set\_header Host $host; 

 } 

 location /socket.io/ { 

 proxy\_pass http://127.0.0.1:8000/socket.io/; 

 proxy\_http\_version 1.1; 

 proxy\_set\_header Upgrade $http\_upgrade; 

 proxy\_set\_header Connection "upgrade"; 

 proxy\_set\_header Host $host; 

 proxy\_read\_timeout 75s; 

 proxy\_send\_timeout 75s; 

 } 

} 

**12\. Persistencia y backup** 

El MVP usara SQLite en modo WAL. Es simple, barato, suficiente para una sola VPS y facil de respaldar. 

| Tabla  | Campos minimos |
| :---- | :---- |
| matches  | id, status, created\_at, updated\_at, state\_json |
| players  | match\_id, player\_id, name, credentials\_hash |
| match\_summaries  | match\_id, winner\_id, score\_json, finished\_at |

 Backup cada 24 horas. 

 Retencion inicial: 7 dias. 

 Formato: frozen-guild-YYYY-MM-DD.db. 

 Restore probado antes de release. 

 No guardar historial eterno en MVP. 

**13\. Frontend, cartas y tablero dinamico** 

boardgame.io no dibuja el juego; React se encarga de la experiencia visual. Esto permite usar cartas con  graficos, tablero dinamico y animaciones sin contaminar la logica de reglas.

| Elemento UI  | Implementacion MVP |
| :---- | :---- |
| Cartas  | Componente Card.tsx con imagen, borde, estado hidden y  overlays. |
| El Hielo  | Grid CSS 3x3; slots clicables segun accion activa. |
| Flip  | CSS transform o Motion opcional. |
| Zona de jugador  | Cartas visibles agrupadas por jugador. |
| Panel de accion  | Botones habilitados segun dado, turno y stage. |
| Resolucion de Orca  | Modal o panel bloqueante para elegir carta a destruir. |

Documento de ejecucion tecnica y producto \- Version PDF 

**Regla visual de seguridad**   
Frozen Guild \- MVP Final 

La UI no debe recibir cardId de cartas ocultas. Si una carta esta boca abajo, el cliente solo recibe  hidden: true. 

**14\. Testing y calidad** 

| Tipo  | Herramienta  | Objetivo |
| :---- | :---- | ----- |
| Unit tests  | Vitest  | deck, setup, scoring, efectos. |
| Integration tests  | Vitest \+ boardgame.io local  | flujos completos sin navegador. |
| E2E  | Playwright  | 2-4 jugadores en navegadores reales. |
| Carga ligera  | Artillery o k6  | 1-2 mesas activas, reconexion, latencia. |
| Lint/formato  | ESLint \+ Prettier  | codigo consistente. |

**14.1 Casos criticos de prueba** 

 Orca recibida por Pesca permite elegir carta a destruir. 

 Orca recibida por Espionaje regalado permite elegir carta a destruir. 

 Orca recibida por Intercambio se resuelve para el jugador receptor. 

 Orca con Foca-Bomba permite destruir la Foca si es target valido. 

 No se puede terminar turno con ORCA\_DESTROY\_SELECTION pendiente. 

 No se puede elegir carta de otro jugador como target de Orca. 

 Foca-Bomba explota si inicio y termino el turno en la zona. 

 El Hielo no filtra cartas ocultas en playerView. 

**15\. Checklist de lanzamiento**

| Item  | Estado objetivo |
| :---- | :---- |
| Reglas cerradas y congeladas  | Si |
| Partida completa 1-4 jugadores  | Si |
| Dado sin reroll  | Si |
| Orca con seleccion obligatoria  | Si |
| Foca-Bomba con stage obligatorio  | Si |
| playerView auditado  | Si |
| SQLite WAL activo  | Si |
| Backup y restore probados  | Si |

Documento de ejecucion tecnica y producto \- Version PDF   
Frozen Guild \- MVP Final 

| Item  | Estado objetivo |
| :---- | :---- |
| Nginx \+ WebSocket estable  | Si |
| PM2 con restart por memoria  | Si |
| Tests unitarios, integration y e2e verdes  | Si |
| 0 bugs bloqueantes abiertos  | Si |

**16\. Riesgos y decisiones pendientes — versión actualizada** 

Esta sección reemplaza la sección 16 anterior del documento MVP. 

**16.1 Desconexión de jugador activo** 

Si un jugador se desconecta durante su turno o durante una resolución obligatoria, el servidor inicia un contador de **30 segundos**. 

Durante esos 30 segundos: 

•    
La partida no avanza automáticamente. •    
El jugador aparece como **reconectando**. •    
Su zona permanece exactamente igual. 

•    
Sus cartas siguen siendo válidas como objetivo de robo, intercambio o regalo, siempre que las reglas normales lo permitan. 

•    
El jugador puede reconectarse y continuar desde el mismo punto. 

Si el jugador no regresa al terminar los 30 segundos: 

•    
El jugador queda marcado como **ausente**. •    
La partida continúa sin expulsarlo de la mesa. •    
Su zona no se limpia, no se protege y no se congela. 

•    
Otros jugadores pueden seguir interactuando con sus cartas mediante reglas normales. •    
Si el turno bloqueado requiere una resolución obligatoria, el servidor aplica una resolución automática mínima. 

**16.2 Resolución automática por ausencia** 

La resolución automática solo existe para evitar que una mesa quede bloqueada. No debe usarse como ventaja estratégica ni como sustituto del turno del jugador. 

**Orca pendiente** 

Si un jugador recibe una Orca y se desconecta antes de elegir la carta a destruir: 

1\.    
Se inicia el contador de 30 segundos. 

2\.    
Si vuelve, el jugador elige normalmente. 

3\.    
Si no vuelve, el servidor resuelve automáticamente. 

4\.  5\.    
La Orca se destruye. 

Si existe otra carta destruible en su zona, se destruye la primera carta válida de izquierda a derecha. 

6\.    
Si no existe otra carta destruible, solo se destruye la Orca. 

1  
**Foca-Bomba pendiente** 

Si una Foca-Bomba debe explotar y el jugador se desconecta antes de resolverla: 

1\.    
Se inicia el contador de 30 segundos. 

2\.    
Si vuelve, el jugador elige normalmente. 

3\.    
Si no vuelve, el servidor resuelve automáticamente. 

4\.    
Se destruye la primera y segunda carta válida de su zona, siguiendo el orden visual de izquierda a derecha. 

5\.    
Si solo hay una carta válida, se destruye una. 

6\.    
Si no hay cartas válidas, no se destruye nada adicional. 

**Regla de orden visual** 

Para que el auto-resolve sea determinista, la zona de cada jugador tiene un orden estable: 

•    
Las cartas nuevas se agregan al final de la zona. 

•    
La UI muestra la zona en el mismo orden que el servidor. 

•    
El orden de izquierda a derecha en UI debe coincidir con el orden del array  players\[playerID\].zone . 

•    
Cualquier intercambio debe actualizar el orden de forma explícita. **16.3 Mesas activas y mesas en pausa** El MVP mantiene un límite estricto de mesas activas para proteger la VPS. Regla final: 

•    
Solo corren las mesas activadas. 

•    
Una mesa activa consume turno, timers y WebSocket vivo. 

•    
Una mesa pausada conserva estado, pero no avanza timers de turno ni resoluciones 

automáticas. 

•    
Cualquier usuario puede activar otra mesa si hay cupo disponible. 

•    
Si el cupo está lleno, la nueva mesa queda en pausa hasta que una mesa activa termine o sea pausada. 

Configuración MVP recomendada: 

•    
MAX\_ACTIVE\_TABLES=1 para VPS de 1GB. •    
MAX\_ACTIVE\_TABLES=2 para VPS de 2GB. 

Decisión práctica para el MVP inicial: 

•    
Mantener **1 mesa activa por defecto**. •    
Permitir **1 mesa adicional en pausa**. •    
Activar manualmente otra mesa solo si hay cupo. 

Esto evita simular un sistema multi-sala grande antes de necesitarlo. 2  
**16.4 UI del MVP** 

La UI del MVP debe ser limpia, funcional y guiada. No se busca una interfaz final todavía. 

Prioridad visual: 

1\.    
Que el jugador entienda de quién es el turno. 

2\.    
Que entienda qué acción puede hacer. 

3\.    
Que entienda cuándo una resolución lo está bloqueando. 4\.    
Que pueda elegir cartas sin ambigüedad. 

5\.    
Que el estado de reconexión o ausencia sea evidente. Fuera de alcance para la primera UI: 

•  •    
Drag & drop. 

Animaciones complejas. •    
Skins. 

•    
Chat. 

•  •    
Ranking. 

Vista móvil perfecta. 

•    
Arte final. 

Elementos mínimos necesarios: 

•  •  •  •    
Lobby simple. Mesa de juego. El Hielo 3x3. 

Zonas de jugadores. 

•    
Panel de dado. 

•    
Panel de acción actual. 

•    
Modal o panel bloqueante para Orca. •    
Modal o panel bloqueante para Foca-Bomba. •    
Indicador de jugador reconectando / ausente. 

•    
Pantalla final de puntuación. 

**16.5 Reglas ambiguas por cerrar antes de Bloque 2** Estas reglas deben quedar congeladas antes de implementar multiplayer real. 

**A. ¿El jugador ausente puede ganar?** 

Decisión recomendada: 

Sí. El jugador ausente sigue en la partida y puede ganar si sus puntos finales alcanzan. Motivo: marcarlo como ausente no equivale a eliminarlo. 

3  
**B. ¿Los demás pueden robarle o intercambiarle cartas al ausente?** Decisión recomendada: 

Sí. Su zona sigue siendo parte del juego. 

Motivo: evita crear protección artificial por desconexión. 

**C. ¿El turno de un jugador ausente se salta?** 

Decisión recomendada: 

Sí, después de resolver cualquier stage pendiente. 

Cuando vuelva su turno y siga ausente: 

•    
El servidor espera 30 segundos. •    
Si no vuelve, marca auto-skip. 

•  •  •    
No lanza dado por él. No ejecuta acción por él. 

Avanza al siguiente jugador. 

Motivo: el servidor no debe jugar por el usuario salvo para desbloquear stages obligatorios. 

**D. ¿Qué pasa si todos menos uno están ausentes?** 

Decisión recomendada: 

La partida continúa si queda al menos un jugador conectado. 

Los turnos ausentes se saltan después de su ventana de 30 segundos. Si todos están ausentes: 

•  •  •    
La mesa se pausa. No corren timers. 

Se conserva estado. 

**E. ¿Qué pasa si el jugador se reconecta después del auto-resolve?** Decisión recomendada: 

Acepta el estado actual de la mesa. 

No se revierte la resolución automática. 

Motivo: revertir causaría conflictos de estado, memoria oculta y sincronización. 4  
**F. ¿El contador de 30 segundos corre en mesas pausadas?** Decisión recomendada: 

No. 

Los timers solo corren en mesas activas. 

Motivo: una mesa pausada debe ser estado congelado, no juego en segundo plano. 

**G. ¿Qué significa “desconecta” técnicamente?** 

Decisión recomendada: 

No se elimina al jugador de la partida. 

Se marca su connectionStatus como: 

type ConnectionStatus \= 'connected' | 'reconnecting' | 'absent'; Y se guarda: 

type PlayerState \= { 

name: string; 

zone: CardId\[\]; 

hasBombAtStart: boolean; 

connectionStatus: 'connected' | 'reconnecting' | 'absent'; disconnectStartedAt?: number; 

}; 

**16.6 Cambios necesarios al modelo de estado** Agregar a GameState : 

type GameState \= { 

activeTable: boolean; 

autoResolveQueue: AutoResolveItem\[\]; 

players: Record\<PlayerID, PlayerState\>; 

}; 

Agregar tipo auxiliar: 

type AutoResolveItem \= { 

playerID: PlayerID; 

stageType: 'ORCA\_DESTROY\_SELECTION' | 'SEAL\_EXPLOSION' | 'TURN\_SKIP'; startedAt: number; 

5  
resolveAfterMs: 30000; 

}; 

**16.7 Riesgos actualizados** 

| Riesgo Decisión MVP |
| ----- |
| Jugador se desconecta durante  Esperar 30s; si no vuelve, destruir Orca y primera carta válida de  Orca  izquierda a derecha. |
| Jugador se desconecta durante  Esperar 30s; si no vuelve, destruir primera y segunda carta  Foca-Bomba  válida de izquierda a derecha. |
| Jugador ausente protege sus  cartasNo. Su zona sigue interactuable. |
| Jugador ausente bloquea la  No. Se auto-resuelven stages obligatorios y se saltan turnos  mesa  futuros. |
| Demasiadas mesas en VPS 1GB MAX\_ACTIVE\_TABLES=1 ; mesas extra en pausa. |
| Complejidad de UI UI limpia, sin drag & drop, sin arte final en MVP. |
| Reglas ambiguas Congelar antes de Bloque 2\. |

**16.8 Decisión final de esta sección** 

El MVP ya no pausará indefinidamente una partida por desconexión. 

La regla final es: 

Si un jugador se desconecta, se le dan 30 segundos para volver. Si no vuelve, queda ausente. Su zona permanece en juego. El servidor solo resuelve automáticamente lo mínimo necesario para desbloquear la partida, usando orden determinista de izquierda a derecha. 

Esta decisión mantiene el juego simple, evita mesas secuestradas por desconexión y no convierte al servidor en un bot que juega por el usuario.

**17\. Veredicto y siguiente paso** 

Frozen Guild es viable si se ejecuta como MVP estricto: 1-4 jugadores, servidor autoritativo, tablero 3x3,  dado sin reroll, boardgame.io para turnos y stages, React para UI y SQLite para persistencia. 

El cambio de Orca queda integrado como regla final: al recibirla, el jugador elige inmediatamente que  carta propia destruir. La Orca tambien se destruye al resolver. Esta eleccion es obligatoria y bloquea el  flujo hasta resolverse. 

**Siguiente paso recomendado** 

Iniciar Bloque 1: repo, TypeScript, cards.ts, deck.ts, setup.ts, tests de mazo y primer tablero local 3x3.  
