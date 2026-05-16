## Layout / 3D Camera Alignment Contract

### Goal
Keep the board visually centered without compensating hacks.

### Rules
1. **Shell owns global centering**
   - `GameShell` is responsible for viewport-level centering and symmetric gutters.
   - No child component may compensate shell offsets with ad-hoc `translateX` / margin tricks.

2. **Stage owns local centering**
   - `CenterBoardStage` centers the board inside the center column using layout primitives (`grid/flex`), not transform offsets.
   - Width constraints are explicit and deterministic.

3. **Camera owns perspective only**
   - `IceGrid` camera layer controls perspective/tilt/parallax only.
   - Camera transforms must not be used to fix layout centering issues.

### Engineering intent
- Single responsibility per layer: shell (global), stage (local), camera (depth).
- Prevent regressions where visual drift is "fixed" in the wrong layer.
- Keep responsiveness predictable across breakpoints.
