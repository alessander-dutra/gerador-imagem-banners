## 2024-05-22 - Gallery Hover Accessibility
**Learning:** Interactive elements hidden via `opacity-0 group-hover:opacity-100` are inaccessible to keyboard users because they remain invisible on focus.
**Action:** Always pair `group-hover:opacity-100` with `group-focus-within:opacity-100` (or `focus-within:`) to ensure controls become visible when tabbing into the container.
