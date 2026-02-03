## 2026-02-03 - Leveraging Native Form Validation
**Learning:** The application relied heavily on custom `onError` state management for validating required fields, which delays feedback until after the "generate" action is triggered.
**Action:** When working on forms in this repo, prefer adding native `required` attributes to inputs first. This provides immediate, accessible browser-level validation before any JavaScript logic needs to run.
