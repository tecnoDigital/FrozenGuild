Necesitamos implementar una animación premium para cuando el dado cae en **6**: este resultado activa el evento **“El Padrino”**.

La UX no debe sentirse como un modal normal, sino como un **momento especial de juego**, tipo recompensa/ritual. Cuando sale 6, el tablero debe reaccionar así:

1. **Pausa dramática**

   * El dado confirma el 6.
   * El tablero baja ligeramente su brillo.
   * El área central se desenfoca de forma sutil, no agresiva.
   * Debe sentirse como: “algo importante acaba de pasar”.

2. **Entrada del Padrino**

   * Aparece una capa encima del tablero con niebla/hielo/luz.
   * El texto principal debe decir algo como:
     **“EL PADRINO TE HARÁ UN FAVOR”**
   * Debajo:
     **“ESCOGE SOLO UNO”**
   * La entrada debe tener peso: caída suave, glow frío, un poco de dramatismo.

3. **Despliegue de contratos**

   * Se muestran 3 cartas/contratos en abanico.
   * Cada contrato representa una acción especial:

     * **PESCA**: "\src\assets\ui\padrino\Padrino-fish.png".
     * **ESPIONAJE / SPY**: "\assets\ui\padrino\Padrino-Spy.png".
     * **INTERCAMBIO / SWAP**: "src\assets\ui\padrino\Padrino-Swap.png".
   * Las cartas deben entrar una por una, como si fueran repartidas por el Padrino.
   * No deben aparecer de golpe.

4. **Interacción**

   * Al pasar el cursor sobre una carta, debe aplicaar el hover
   * Al seleccionar una, esa carta se queda al frente.
   * Las otras se apagan o se van a segundo plano.
   * Después aparece un sello o confirmación:
     **“CONTRATO ACEPTADO”**
  * permite hacer la accion selecioanda y cambia el area de accion a boton correndiente ( Sky y swap tienene unos botones espaciales el dado agrega esos botones con la interface de padrino + los botnonees correspndientes )

5. **Regla importante**

   * El jugador solo puede elegir **un contrato**.
   * Una vez elegido, las otras opciones quedan deshabilitadas.
   * El backend debe ser la fuente de verdad: el frontend solo anima y manda la elección.

6. **Sensación visual**

   * Debe sentirse como una UX de juego premium, no como UI plana.
   * Referencias de intención:

     * Marvel Snap: impacto, foco, cartas con presencia.
     * Mafia ártica: contratos, favores, niebla, hielo, glow frío.
     * Tablero vivo: el fondo no desaparece, solo queda subordinado al evento.

7. **Criterio de calidad**

   * Si el usuario ve salir el 6, debe entender inmediatamente:
     “me salió algo especial”.
   * Si ve las 3 cartas, debe entender:
     “puedo elegir solo una recompensa”.
   * Si elige una carta, debe sentir:
     “ya acepté el favor del Padrino”.
