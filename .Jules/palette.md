## 2026-02-04 - Icon Buttons & Form Validation
**Learning:** Icon-only buttons (like "remove image") are invisible to screen readers without `aria-label`, and missing `required` attributes on form inputs forces users to wait for manual validation instead of getting immediate browser feedback.
**Action:** Always verify icon-only buttons have descriptive labels and use native HTML attributes for core validation before adding custom logic.
