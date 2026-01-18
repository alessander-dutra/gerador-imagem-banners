## 2026-01-18 - [Accessibility] Hidden Overlays on Focus
**Learning:** Interactive overlays using `opacity-0 group-hover:opacity-100` are invisible to keyboard users when they tab into the buttons inside.
**Action:** Always add `group-focus-within:opacity-100` to any hover-dependent overlay that contains interactive elements to ensure they become visible on focus.
