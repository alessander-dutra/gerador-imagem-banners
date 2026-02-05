## 2026-02-05 - Icon-Only Buttons Missing Accessibility Labels
**Learning:** Several icon-only buttons (Remove reference, Zoom controls, Close lightbox, Inspect details) relied solely on visual icons or `title` attributes, making them inaccessible to screen readers which often ignore `title` or require specific settings to read it.
**Action:** Always pair icon-only buttons with an explicit `aria-label` describing the action, and use `aria-hidden="true"` on the SVG icon to prevent redundant or confusing announcements.
