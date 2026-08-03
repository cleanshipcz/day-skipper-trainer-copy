# Ropework knot content sources

The `src/data/ropeworkKnots.ts` teaching copy was reviewed on 2026-08-01.
The concise card text is a safety-focused synthesis, not a substitute for
hands-on instruction, the vessel's procedures, or rope-manufacturer guidance.
Rope type, diameter, condition, load, hardware, and the ability to inspect the
knot all affect whether a knot is suitable. Tails described as “generous” must
be appropriate to those factors and any applicable onboard standard.

## Expert basis

- **Animated Knots by Grog — Bowline:** describes a reasonably secure end loop,
  mooring use, inability to release it while loaded, unloaded shaking, and the
  need for a long tail under intermittent load. Its technical notes cite
  Clifford W. Ashley, *The Ashley Book of Knots* (ABOK #1010).
  <https://www.animatedknots.com/bowline-knot>
- **Animated Knots by Grog — Clove Hitch:** limits it to temporary uses, warns
  that it can slip under strain or bind after heavy loading when used alone,
  and recommends securing a fender's hitch with half hitches or selecting
  another mooring hitch (ABOK #1245).
  <https://www.animatedknots.com/clove-hitch-knot-rope-end>
- **Animated Knots by Grog — Square/Reef Knot:** identifies it as a binding
  knot, documents spilling/capsizing when misused as a bend, and says never to
  use it for critical loads (ABOK #1402).
  <https://www.animatedknots.com/square-knot>
- **Animated Knots by Grog — Figure Eight:** documents its use as a convenient,
  non-binding stopper and warns that it can fall undone; larger, more stable
  stoppers are preferable in some applications (ABOK #570).
  <https://www.animatedknots.com/figure-8-knot>
- **Animated Knots by Grog — Round Turn and Two Half Hitches:** explains that
  the round turn controls strain, additional turns may be needed, and successive
  half hitches are tied in the same direction (ABOK #1720).
  <https://www.animatedknots.com/round-turn-two-half-hitches-knot>
- **Animated Knots by Grog — Sheet Bend:** specifies the thicker rope as the
  bight, tails on the same side, longer tails for critical loads, and a Double
  Sheet Bend for a large diameter difference (ABOK #1431).
  <https://www.animatedknots.com/sheet-bend-knot>
- **U.S. Coast Guard Auxiliary, *Boat Crew Handbook — Seamanship
  Fundamentals* (BCH16114.4):** provides the operational Rolling Hitch tying
  sequence, including the doubled gripping turn followed by a half hitch.
  <https://rdept.cgaux.org/documents/BoatCrewHandbooks/BoatCrewBCH16114.4.pdf>
- **Animated Knots by Grog — Rolling Hitch:** distinguishes the rope-on-rope
  Ashley Version 2, requires pull nearly parallel to the main rope, shows the
  tucked second turn and final half hitch, and warns that slippery modern rope
  or an off-axis pull can make it fail (ABOK #1735).
  <https://www.animatedknots.com/rolling-hitch-knot>
- **NSW Government, Dogging and Rigging Guide — Knots:** independently confirms
  that Rolling Hitch turns must be placed in the proper direction of pull.
  <https://www.nsw.gov.au/employment/dogging-and-rigging/guide/part-1-general-rigging-principles/lifting-equipment/fibre-rope-and-slings/knots>

## Editorial decisions protected by tests

The content tests require every knot to include dressing/setting, inspection,
and tail guidance. Exact approved safety sentences additionally preserve the
Reef Knot prohibition, Clove Hitch changing-load warning, Bowline cyclic-load
qualification, and the Rolling Hitch's load axis, gripping-turn placement,
tucked second turn, finishing half hitch, and material/load-direction
limitations. Exact assertions deliberately bind each knot, operating condition,
warning or prohibition, and failure mode together so reversed advice cannot
pass as a bag of matching keywords.

## Diagram provenance and licence

All seven final-form diagrams in `src/components/ropework/KnotDiagram.tsx`
were drawn for this project as original, code-native SVG paths on 2026-08-01.
They do not copy or trace the linked tutorial artwork. They are project-owned
work.

The diagram artwork — specifically the SVG geometry and visual composition in
`src/components/ropework/KnotDiagram.tsx`, excluding the surrounding software
code and teaching text — is licensed under the **Creative Commons Attribution
4.0 International licence (CC BY 4.0)**. Reusers must attribute it as
“Day Skipper Trainer knot diagrams, Cleanship, 2026”, name CC BY 4.0, and link
to <https://creativecommons.org/licenses/by/4.0/>. The full legal terms are at
<https://creativecommons.org/licenses/by/4.0/legalcode>. No endorsement is
implied. This explicit artwork licence is independent of any software licence.

The external tutorials are optional references only; no external image, animation,
page text, or other copyrighted media is bundled or scraped.

Each catalogue record owns a plain-text visual description naming the standing
part, working end, load direction, dressing, and final form. The SVG exposes
that description as its accessible name and repeats it as a visible caption.
Automated content checks validate the known HTTPS tutorial destinations and
their knot-specific path without fetching third-party pages. This deliberately
checks link integrity and content match without scraping external content.
