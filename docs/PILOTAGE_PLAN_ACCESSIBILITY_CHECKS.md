# Pilotage plan accessibility and responsive checks

Automated component coverage verifies the semantic ordered list and named form,
unique row-action names, input units/constraints, inline error association and
focus, live add/edit/remove/move/save feedback, single Enter submission, touch
target/reflow classes, and a controls-free nonvisual-readable print artifact.

Before release, exercise `/pilotage/plan` with a long value in every text field:

| Setup | Verification |
| --- | --- |
| 375 CSS px | No document-level horizontal overflow; actions reflow to two columns; all controls remain at least 44 px high. |
| 768 CSS px | Fields use two columns without clipping; long marks, hazards, and contingency text wrap. |
| 1280 CSS px | Content remains in the bounded route container and reading/order sequence is unchanged. |
| 200% browser zoom | Repeat the 375 px checks; no content or focused control is obscured. |
| Keyboard only | Tab order follows legs, form, briefing, and completion; Enter in a form field submits once; invalid submission focuses the first invalid field. |
| Touch | Reorder, edit, remove, add, print, briefing, and complete targets operate without adjacent-target activation. |
| Screen reader | Ordered-leg count/order, unique action names, labels with constraints/units, validation error and focused field, mutation feedback, save result, and cockpit-plan headings/details are announced in context. |

Print preview must contain only the ordered cockpit plan. Confirm each leg avoids
page splitting and remains understandable without colour, layout, or controls.
