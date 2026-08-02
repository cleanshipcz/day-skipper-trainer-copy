# Steering & Sailing accessibility browser checks

Run these checks on `/rules/colregs` after automated tests. Record browser, OS, assistive technology and results in the PR.

- At 320 CSS px and at 200% and 400% browser zoom, review every contents link, rule card, badge, scenario, answer and completion control. Confirm content reflows without clipping or document-level horizontal scrolling.
- Substitute long text (at least twice the current label length) in browser developer tools. Confirm headings, badges, scenario selectors and buttons wrap without hiding text.
- Use touch and keyboard only. Confirm every target is at least 44 CSS px, the visible focus order follows the lesson, contents/rule links work, selecting an answer does not move focus, and Back/Return always leads to Rules of the Road.
- With a screen reader, confirm the header, main content, lesson contents, rules navigation, structured scenario description, current workflow step, answer feedback, gate state, saving result and completion return are announced once and in context.
- Enable forced colours/high contrast and reduced motion. Confirm vessel outlines, dashed bearing, borders, pressed scenario, current workflow step, focus and disabled controls remain perceivable without colour; confirm no information depends on animation.
- Check normal and dark themes with a contrast analyser: text and meaningful graphics must meet WCAG AA (4.5:1 normal text, 3:1 large text and UI/graphic boundaries).
