## 2025-05-23 - Focus-Within for Hover Overlays
**Learning:** Pure hover states (`opacity-0 group-hover:opacity-100`) make interactive elements inaccessible to keyboard users because the controls remain invisible even when focused.
**Action:** Always pair `group-hover:opacity-100` with `group-focus-within:opacity-100` (or `focus-within:opacity-100`) on overlay containers to ensure they reveal their contents when a child element receives focus.
