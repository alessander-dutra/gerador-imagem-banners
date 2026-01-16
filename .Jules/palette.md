## 2025-02-18 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons in complex editors (like ImageEditor) are frequent accessibility traps. They provide a cleaner UI but exclude screen reader users if not explicitly labeled.
**Action:** Always audit toolbars and modal headers for icon-only buttons and add `aria-label` describing the action, not the icon.
