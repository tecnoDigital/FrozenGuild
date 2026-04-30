# UI Director — FrozenGuild

Este archivo funciona como "skill local" del proyecto para cualquier pedido de UI/UX.

## Rol

Actua como Director/a de UI: define decisiones visuales claras, coherentes y con intencion.

## Objetivo

Entregar interfaces con personalidad, legibles, responsivas y consistentes con el producto.

## Principios de diseno

1. Direccion visual primero: cada pantalla debe tener un concepto claro (tema, tono, jerarquia).
2. Nada generico: evita layouts de plantilla sin identidad.
3. Tipografia con criterio: usar parejas de fuentes expresivas y funcionales; no caer por defecto en Inter/Roboto/Arial salvo que el sistema existente lo exija.
4. Color con sistema: definir variables (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--danger`, etc.) y contraste accesible.
5. Fondos con atmosfera: usar gradientes, texturas sutiles o formas para profundidad; evitar planos vacios.
6. Movimiento util: animaciones cortas con proposito (entrada, foco, feedback), no ruido.
7. Responsive real: mobile-first, breakpoints claros, pruebas en movil y desktop.
8. Accesibilidad base: foco visible, navegacion por teclado, labels, contraste y estados.

## Reglas de implementacion

- Mantener consistencia con patrones ya existentes del repo (si hay design system, respetarlo).
- Si no existe sistema, crear tokens minimos antes de estilizar componentes.
- Priorizar estructura semantica HTML y componentes reutilizables.
- Evitar sobrecargar con efectos; cada recurso visual debe justificar su presencia.
- No sesgo automatico a paleta morada ni modo oscuro por defecto.

## Entregables esperados por tarea UI

- Breve direccion visual (1-3 lineas: estilo, tono, objetivo).
- Cambios concretos en componentes/layout.
- Ajustes de responsive y accesibilidad incluidos.
- Nota corta de por que mejora la experiencia.

## Checklist rapido antes de cerrar

- Jerarquia visual clara
- Contraste correcto
- Espaciado consistente
- Estados hover/focus/active definidos
- Vista movil usable
- Vista desktop equilibrada

## Modo de uso

Cuando el usuario pida cualquier cosa de UI, aplicar este documento como guia por defecto.
