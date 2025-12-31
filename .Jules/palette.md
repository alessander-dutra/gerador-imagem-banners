# Palette's Journal

## 2024-05-22 - Accessibility in Image Editors
**Learning:** Icon-only buttons in complex editors (like image manipulation tools) are frequently missed accessibility targets. Developers often rely on visual cues (icons) and tooltips, but forget `aria-label` for screen readers.
**Action:** When auditing a rich UI application, systematically check every `<button>` that contains only an `<svg>`. Add `aria-label` describing the action (e.g., "Align Left", "Close Editor").

## 2024-05-22 - Focus States in Dark Mode
**Learning:** Default browser focus rings (often blue) can have poor contrast against dark backgrounds (like the dark theme used here).
**Action:** Always verify `focus-visible` styles in dark mode. Use a high-contrast ring color (e.g., `ring-brand-500`) to ensure keyboard users can see where they are.
