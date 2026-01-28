# Palette's Journal

## 2026-01-28 - Icon-Only Buttons and Native Validation
**Learning:** Icon-only buttons are a common pattern for cleaner UIs (like editors and galleries), but often miss accessible labels, making them invisible to screen readers. Native HTML validation (`required`) provides immediate, accessible feedback without custom JavaScript logic.
**Action:** Always audit icon-only buttons for `aria-label` or `title` (preferably `aria-label`) and prefer native HTML attributes for form validation where possible.
