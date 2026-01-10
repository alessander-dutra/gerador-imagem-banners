## 2024-05-23 - Accessibility First
**Learning:** Icon-only buttons are a common pattern in this app but consistently lack accessible labels.
**Action:** When creating or modifying components with icon-only buttons, always ensure an `aria-label` is present, even if a `title` attribute exists, as `aria-label` is more robust for screen readers.
