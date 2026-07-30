# Victualling (Provisioning) learner-facing audit

- Audit issue: [#95](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/95)
- Route/topic: `/victualling` / `victualling`
- Audited: 2026-07-31
- Primary implementation: `src/pages/VictuallingTheory.tsx`
- Checklist catalogue: `src/data/victuallingItems.ts`
- Related quiz: `src/data/quizzes/victualling.ts`, `src/pages/Quiz.tsx`
- Related registry/route: `src/constants/topicRegistry.ts`, `src/app/routes.tsx`

## Verdict

**The route is a visually tidy shopping checklist, but it is not yet a
dependable provisioning lesson, passage-planning tool, or durable completion
experience.** Its 18 controls cover a few useful prompts and the quiz handoff
is correctly registered. However, an item cannot be unchecked after a mistake,
all checklist state and points disappear on navigation or reload, and the
global progress system never learns that the theory was completed.

The learning content is too categorical for a safety-relevant planning task.
Fixed rules such as 50% extra days, 2 L drinking water per person/day, produce
for 2–3 days, and “full” gas bottles are presented without vessel, crew,
passage, climate, capacity, reserve, or consumption assumptions. There is no
worked provision calculation, menu or dietary planning, safe stowage method,
potable-water hygiene, food-safety process, or adequate galley/LPG guidance.
The page also mixes safety equipment and clothing into victualling without
explaining the limits of that list.

Finally, the quiz asks about several subjects the page never teaches. Completion
therefore means 18 possession clicks, not readiness for the linked assessment
or the ability to provision a real passage.

## Evidence and exercised paths

### Method and scope

The page, catalogue, route definition, topic registry, dashboard entry, shared
progress hook, and linked quiz data/flow were inspected directly. A production
build completed successfully with the repository's configured environment. The
interaction state transitions were traced through the controlled Radix
checkboxes and React handlers, including repeated activation, all-items
completion, remount/reload, empty-catalogue arithmetic, and quiz navigation.

Observed and source-confirmed results:

- `/victualling` is registered as a lazy route and as a root topic. The
  dashboard has a Victualling card, and the completion action targets the
  registered `/quiz/victualling` route.
- The page starts at 0/18 items and 0 points. Each first check awards 5 points,
  so checking all 18 produces 18/18, 100%, and 90 local points.
- A checked Radix checkbox requests `false` when activated again, but
  `onCheckedChange` discards the value and `handleCheckItem` only changes
  unchecked items to `checked: true`. Mistakes cannot be corrected.
- Repeated activation of an already checked item does not add more points, but
  also gives no explanation that unchecking is unsupported.
- The quiz action is hidden until every catalogue entry is checked. When all
  are checked it navigates to `/quiz/victualling`.
- Checklist and score live only in component state. Navigation, refresh, and a
  new session restore the module-level false defaults. `useProgress`, the
  registered `victualling` ID, authenticated storage, and anonymous storage are
  never read or written.
- With an empty checklist, `checkedItems === totalItems` is true while
  `(0 / 0) * 100` is `NaN`; the page would claim provisioning complete and
  render an invalid progress width.
- All item controls are native/Radix checkboxes associated with labels, so the
  basic check action is available to pointer, touch, and keyboard users.

The browser-control service was unavailable in this run, so no claim is made
for pixel-level overflow, a real screen-reader session, or browser-specific
focus/announcement behavior. Static responsive classes and DOM semantics were
reviewed at the intended 320–1280 CSS px range. No live authenticated
persistence round-trip, food laboratory check, vessel inspection, or legal
requirements review for a specific flag or cruising area was performed.

### Learning model, completion, and edge states

- The interaction is an inventory self-attestation, not a lesson. It supplies
  no learning objectives, explanations per item, planning sequence, decision
  prompts, worked calculations, knowledge checks, sources, or remediation.
- Categories are generated from current data insertion order. This works for
  the supplied catalogue, but there is no explicit ordering contract, schema
  validation, duplicate-ID protection, empty-state message, or malformed-data
  fallback. Follow-up #186 owns catalogue validation, stable ordering,
  duplicate-ID handling, and safe empty/malformed-data behavior alongside
  persistence.
- Completion says **Provisioning complete** and “Ready for the quiz?” merely
  because every box was clicked. It does not establish quantities, actual
  availability, expiry, suitability, safe stowage, or understanding.
- Local points are disconnected from durable engagement/profile points.
  Learners get an immediate success toast for possession clicks but no
  completion save, retry, pending, offline, conflict, or identity-change state.
- The quiz is inaccessible from this page until the 18-click self-attestation.
  There is no optional-practice link, return context, or mapping from checklist
  items to assessment objectives.

### Passage-specific quantities and worked planning

“Always provision for 50% more days” is an unjustified universal rule.
Contingency should follow the passage, forecast uncertainty, ports/alternates,
crew, vessel reliability and capacity, and applicable operating guidance. A
50% margin can be inadequate for one passage and needlessly burdensome for
another.

“Minimum 2L per person per day for drinking” is also too context-free to serve
as a safe provision figure. Total potable-water planning must account for
crew, time, climate and exertion, cooking, drinks, hygiene and medical needs,
expected resupply or watermaker availability, unusable tank volume, leakage or
contamination, and a protected reserve. The page does not teach a learner to
compare calculated demand with actual tank/container capacity.

The remaining quantities are not actionable:

- “3 meals/person/day” counts meal occasions but provides no energy, nutrition,
  ingredient, dietary, preparation, or cooking-resource plan;
- “as needed,” “as preferred,” “adequate supply,” “multiple,” and “complete
  kit” cannot be checked objectively;
- produce does not share a universal 2–3-day life—item, ripeness, ventilation,
  temperature, humidity, bruising and storage method materially change it;
- “full bottles” gives no compatible fuel type, usable mass, appliance burn
  rate, passage allowance, safe spare policy, or capacity check.

There is no example such as a four-person, three-day passage with explicit
water, meal, reserve, volume, weight, stowage, and fuel arithmetic.

### Food, water, storage, and waste

Waterproof containers and limited refrigeration are useful prompts, but they
are not a stowage plan. The lesson omits heavy items low and secure, preventing
movement and chafe, keeping emergency water separate, quick access to
rough-weather food, dry/ventilated storage by commodity, stock rotation,
inventory and location records, expiry/condition checks, and separation from
fuel, chemicals, bilge water, raw foods, and allergens.

No potable-water hygiene is taught: clean tanks and containers, protected
fillers, known sources, contamination response, inspection/treatment according
to authoritative guidance, or safe separation of reserve containers. Food
safety similarly lacks cold-chain/temperature control, hand and surface
hygiene, safe cooking/reheating, damaged or swollen cans, spoilage indicators,
and pest control.

The page never asks for allergies, intolerances, dietary restrictions,
preferences, prescription interactions, or suitable alternatives. It also
does not plan balanced meals, snacks for watchkeepers, seasickness-tolerable
foods, or pre-prepared/no-cook options for rough weather.

“Minimize packaging” is directionally useful, but learners also need a plan to
retain, segregate, and lawfully dispose of waste under the rules that apply to
their voyage. “Eco-friendly” and “biodegradable” product labels do not by
themselves establish that discharge is permitted or harmless.

### Galley, safety inventory, and scope

The page mixes provisioning with first aid, medication, sunscreen, flares,
clothing, and waterproof gear. These are valuable pre-departure considerations
but are not a complete safety-equipment audit. Carriage and expiry requirements
for pyrotechnics, first-aid contents, and medication decisions vary with vessel,
voyage, flag/local rules, manufacturer instructions, and professional advice.
The lesson neither qualifies those prompts nor directs learners to the
dedicated safety and pre-departure modules.

The gas/fuel prompts are especially incomplete. There is no instruction about
approved compatible cylinders and components, ventilated locker stowage,
regulator/hose/system checks, safe leak detection, LPG collecting low in the
vessel, bottle and appliance shutoff, ventilation, flame supervision, or leak
and fire response. It also omits gimballed-stove locking/operation, pot
restraints, pan handles, hot-liquid/scald protection, and when conditions call
for cold/pre-prepared food instead of cooking.

A waterproof ignition source is not a substitute for a safely maintained
installation and operating procedure. “Full bottles” can encourage a
possession check without verifying compatibility, condition, storage, or
consumption.

### Theory and quiz alignment

The first five quiz questions mostly repeat the four guideline cards and fresh
produce row, including their categorical 2 L, 50%, and 2–3-day answers. Seven
later questions assess material absent from the theory page:

- removing paper labels and waterproof-marking tins;
- meal planning and rough-weather first-day food;
- allergies and dietary requirements;
- LPG bilge/explosion risk and shutoff at the bottle;
- why a stove is gimballed;
- oilskin trousers as scald protection.

Several are worthwhile topics, but two assessed claims require authoritative
validation rather than being copied into theory:

- Removing original tin labels is unsafe/incomplete advice unless all
  safety-critical traceability is durably preserved. A casual waterproof name
  can lose ingredients and allergens, expiry/best-before information,
  preparation instructions, batch/lot identifiers, and recall information.
  Any retained wet-stowage method must preserve or record all of that
  information and keep it reliably associated with the correct container.
- “Oilskin trousers protect against scalds” should not be taught as a
  sufficient or generally authoritative control without a suitable source and
  material-specific assessment. Primary controls should avoid handling hot
  liquids when conditions make it unsafe, use appropriate stove gimbals and
  locks, pot restraints/lids and secure handholds, keep people clear, and
  choose pre-prepared/no-cook food. Protective clothing cannot make unsafe
  cooking conditions safe and some materials can retain hot liquid against
  skin.

The learner receives no teaching or explanation before assessment. Conversely,
most of the 18 checklist items have no aligned assessment. Checking all items
therefore neither demonstrates nor prepares quiz readiness. Follow-up #191
requires these two claims to be validated, rewritten, or removed in
coordination with the dedicated quiz audit
[#96](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/96).

### Visual quality, accessibility, and input

The card hierarchy, category grouping, generous item targets, visible
quantities, and text-plus-checkbox checked state form a clean basic layout.
There are no diagrams or explanatory visual media to verify, but there are also
no planning tables, stowage visual, worked quantities, or safety illustrations
to support the subject.

Accessibility and responsive concerns remain:

- Back is an icon-only button with no accessible name.
- The trophy number has no programmatic or visible “points” label.
- The custom progress track has no `progressbar` role, accessible name, minimum,
  maximum, or current value.
- Item count, score, progress, toast, and newly mounted completion panel do not
  form a coherent announced status; focus remains on the final checkbox when
  the quiz action appears elsewhere below it.
- Checked labels use reduced-contrast muted text and line-through in addition
  to checkbox state; contrast and forced-colour behavior are unverified.
- The sticky header forces title/subtitle and two progress clusters into one
  non-wrapping row. The completion card similarly forces copy and a large
  button into one row. At 320 CSS px, 200% zoom, or with longer translations,
  the structure has no explicit reflow rules and is likely to crowd or
  overflow.
- Item labels also keep text and quantity in one row, making long content and
  narrow layouts fragile.
- The animated progress width does not honor reduced-motion preferences.

## Focused follow-up issues

- [#186 — Make Victualling checklist progress reversible, durable, and
  completion-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/186)
- [#187 — Replace Victualling's universal allowances with a passage-specific
  provisioning plan](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/187)
- [#188 — Teach food, potable-water, dietary, and stowage safety in
  Victualling](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/188)
- [#189 — Separate provisioning from safety inventory and add safe galley/LPG
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/189)
- [#190 — Make Victualling progress and completion accessible and
  responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/190)
- [#191 — Align Victualling theory coverage and completion with its
  quiz](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/191)
