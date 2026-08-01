# Jib and forestay geometry remediation

- Follow-up issue: #142
- Learner-facing routes: `/nautical-terms/boat-parts` and `/nautical-terms/sail-controls`
- Reviewed: 2026-08-01

## Sailing-reference basis

The redraw uses a conventional three-cornered jib: the head and tack define a
forward luff that follows the forestay, while the clew sits aft. This is based
on the US Sailing-hosted Wayfarer class rules, section 32, which defines the jib
as a three-cornered sail and separately measures head-to-tack luff,
tack-to-clew foot, and head-to-clew leech. The rules also explicitly distinguish
the luff from the forestay. The US Sailing-hosted Snipe class rules, C.10.6,
likewise specify a jib halyard connected to the luff wire or line and attachment
at the deck/forestay fitting.

References:

- [Wayfarer International Class Rules, section 32](https://www.ussailing.org/wp-content/uploads/2020/07/Wayfarer-09ClassRules.pdf)
- [Snipe Class Rules, C.10.6](https://www.ussailing.org/wp-content/uploads/2020/07/Class-Rules-Snnipe-Class-World-Sailing-2.pdf)

## Geometry decisions and verification

- Boat Parts keeps the forestay visible from masthead to bow and ends the jib
  luff/tack short of the bow attachment. The jib marker lands inside the sail;
  the forestay marker lands on the exposed stay, so the two answers are
  unambiguous. The backstay, masthead, deck, and bow endpoints were checked
  after the redraw.
- Sail Controls uses the same conceptual orientation at its independent scale.
  The jib halyard starts at the head, and the jib sheet starts at the clew and
  runs aft (away from the bow) through the fairlead toward the cockpit/winch.
  Their labels, highlight groups, and click handlers remain on the same SVG
  groups as the redrawn paths.
- Automated DOM geometry tests lock the jib, forestay, halyard, sheet, marker,
  and endpoint relationships, including the clew-to-fairlead-to-winch aftward
  ordering. The Sail Controls diagram retains a 600 px effective minimum width
  in a horizontal scroll container on narrow screens, and each of its 12
  controls has a transparent SVG hit region at least 44 by 44 units. Interaction
  tests exercise sheet highlighting and fairlead activation through that hit
  region.
