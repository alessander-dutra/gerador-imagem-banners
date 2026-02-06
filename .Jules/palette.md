# Palette Journal

## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** The application makes heavy use of icon-only buttons for critical actions (delete, zoom, edit) without providing accessible names, making them invisible to screen reader users.
**Action:** Establish a pattern of always adding `aria-label` to any button that lacks visible text content.

## 2024-05-22 - Native Form Validation
**Learning:** Using the native `required` attribute provides immediate, accessible feedback without custom JavaScript overhead.
**Action:** Audit all mandatory inputs to ensure they use native validation attributes where possible.
