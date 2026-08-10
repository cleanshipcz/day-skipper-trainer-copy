# Clearing Bearings accessibility checks

For `/pilotage/clearing-bearings`, verify the Purpose, Plotting, Conventions,
Monitoring, and Practice tabs at 375, 768, and 1280 CSS px and at 200% browser
zoom. The page must not create document-level horizontal scrolling. The tab
list may scroll horizontally on narrow screens; the practice chart must keep
its 5:3 shape, and the bearing, rule, and action controls must reflow without
overlap or clipping.

Keyboard checks:

- Move through the tabs with Tab and the Radix tab arrow-key behavior.
- In Practice, adjust the bearing with arrow keys, choose NLT or NMT, and press
  Enter on **Check plotted answer**. One result is produced and focus moves to
  the labelled feedback region. **Next scenario** returns focus to the bearing
  control for the new task.
- Complete both scenarios and confirm save failure, retry, and saved states are
  presented without duplicate submission.

Touch checks on real hardware or device emulation:

- Swipe the narrow tab list horizontally, then begin a vertical page scroll on
  a tab and confirm ordinary page scrolling remains available.
- Drag the range control and then scroll vertically from it. NLT, NMT, Check,
  Next, Record, and Retry targets remain at least 44 CSS px high.

Screen-reader checks (NVDA/Firefox, VoiceOver/Safari, or equivalent):

- Confirm the chart is announced by scenario name and its description identifies the
  magenta bearing mark, red hazard and clearance boundary, known-safe blue
  observation, plotted blue bearing, and revealed green tangent.
- The `Chart measurements` list provides the equivalent numeric task without
  relying on colour or position alone.
- Confirm changing the range announces the measured value and clearance
  relationship. After submission, confirm focus moves to the labelled answer
  feedback and the message is spoken once rather than once for focus plus once
  as a live-region update.

Contrast checks:

- Inspect normal and dark themes with a contrast analyser. Body text and result
  text must meet 4.5:1; large text and essential chart strokes must meet 3:1.
  Feedback uses dark green/red text on pale backgrounds and never colour alone:
  it also includes an icon and explicit message.

Component tests cover the structured alternative, accessible chart description,
feedback focus, Enter form submission, 44 px targets, touch-action configuration,
and responsive breakpoint classes. Browser zoom, physical touch behavior,
platform screen-reader speech, and measured rendered contrast remain manual
release checks because DOM component tests cannot verify them faithfully.
