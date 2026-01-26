## 2024-05-23 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Widespread use of icon-only buttons (using SVGs) without `aria-label` attributes makes the application significantly inaccessible to screen reader users. This was found in critical workflows like Banner Generation, Gallery inspection, and Image Editing.
**Action:** Always verify icon-only buttons have an `aria-label` or `aria-labelledby`. Add this check to the PR review checklist.
