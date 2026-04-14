# Brain

Public-safe architecture note only. Detailed implementation and operator reasoning are maintained privately.

## 2026-04-14 Architecture Note

- Public shared-world writes now route through `src/game/trust.js` before local or remote persistence.
- Sun Director planning lives in `src/game/sharedWorld.js` and is exposed through the shared-world snapshot.
- `src/App.jsx` remains the largest maintainability risk; the next technical milestone is extracting UI panels and runtime services without changing gameplay behavior.
