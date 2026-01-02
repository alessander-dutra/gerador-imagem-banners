## 2024-05-24 - Inconsistent Keyboard Navigation in Modals
**Learning:** Found that while the `Gallery` lightbox supported Escape key closing, the `ImageEditor` modal did not. This inconsistency confuses users who expect standard modal behavior.
**Action:** When creating new modals, always check `Gallery` or other existing modals to copy-paste the `useEffect` for keyboard handling.
