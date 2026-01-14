## 2024-05-23 - [Keyboard Accessibility for Hover Overlays]
**Learning:** Hover-based overlays (like gallery item actions) are completely inaccessible to keyboard users unless they also trigger on focus.
**Action:** Always pair `group-hover:opacity-100` with `group-focus-within:opacity-100` to ensure controls become visible when tabbing through the interface.
