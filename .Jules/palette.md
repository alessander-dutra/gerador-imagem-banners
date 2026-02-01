## 2024-05-23 - Accessibility of Icon-Only Buttons
**Learning:** The application heavily relies on icon-only buttons for critical actions (close, remove, align), but these consistently lack `aria-label` attributes, making them inaccessible to screen reader users who only hear "button".
**Action:** Establish a strict pattern where every icon-only button must have an `aria-label` describing its action, and the internal SVG icon should have `aria-hidden="true"`.
