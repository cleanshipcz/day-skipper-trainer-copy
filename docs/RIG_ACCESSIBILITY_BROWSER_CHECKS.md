# Rig accessibility browser checks

Run these checks on `/rig` with current Chrome, Firefox, and Safari before a release that changes the lesson interaction.

- At 320 CSS px and at 200% and 400% browser zoom, confirm text and controls reflow without page-level horizontal scrolling. The labelled diagram may scroll within its named region, and its complete numbered text alternative must remain visible.
- Use Tab, Shift+Tab, arrow keys, Space, and Enter to complete the review and all three evidence observations. Confirm visible focus, logical order, equivalent feedback, and focus moving only after the user activates **Next observation**.
- Repeat the interaction with touch or device emulation. Confirm radio labels and buttons retain at least the 44px touch baseline and no hover-only information is required.
- With a screen reader, confirm the back button name, instructions, observation progress, polite decision feedback, saved-state messages, review progress, completion announcement, and the clear route to the Rig quiz. Completion must not steal focus while outcomes are being recorded.
- Enable increased contrast/forced colours and reduced motion. Confirm borders, selected native radio states, warnings, completion text, and focus remain perceivable without colour alone; confirm no essential animation or motion remains.
- Replace an observation and decision string with a substantially longer test string in devtools and confirm wrapping does not cover, clip, or push controls outside their containers.
