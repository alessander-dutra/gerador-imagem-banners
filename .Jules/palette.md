## 2024-05-22 - Missing Entry Script
**Learning:** The `index.html` file was missing the `<script type="module" src="/index.tsx"></script>` tag, preventing the app from mounting. This seems to be a recurring issue or a specific state of the repo.
**Action:** Always check `index.html` for the entry script tag if the app renders a blank screen.

## 2024-05-22 - Accessibility Verification
**Learning:** Verifying `aria-label` on conditionally rendered elements (like the "Remove reference image" button) requires simulating the condition (e.g., file upload) in the test script. The `ApiKeySelector` modal also needs to be bypassed for frontend tests.
**Action:** Use `page.add_style_tag` to hide blocking modals and programmatically set input files to trigger UI states.
