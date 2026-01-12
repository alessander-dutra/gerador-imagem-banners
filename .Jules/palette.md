# Palette's Journal

## 2024-05-20 - Range Input Labels
**Learning:** Range inputs often lack programmatic association with their visual labels when they are just text in a div above the input.
**Action:** Always ensure `input[type="range"]` has a matching `aria-label` or `aria-labelledby` if the visual label isn't using a `<label>` tag.
