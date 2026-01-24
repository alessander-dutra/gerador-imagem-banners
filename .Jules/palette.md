## 2026-01-24 - Invisible Focus Traps in Overlays
**Learning:** Interactive elements nested inside `opacity-0 group-hover:opacity-100` containers are tabbable but invisible to keyboard users, creating a confusing focus trap.
**Action:** Always pair `group-hover:opacity-100` with `group-focus-within:opacity-100` for overlay containers to ensure keyboard users can see what they are focusing on.
