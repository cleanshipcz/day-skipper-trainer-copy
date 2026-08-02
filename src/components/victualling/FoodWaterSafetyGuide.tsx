import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topics = [
  { title: "Crew needs before menus", body: "Ask every crew member privately about allergies, intolerances, dietary needs and preferences, and medical constraints that affect food or hydration. Record safe alternatives and who they are for before choosing the menu; never treat medication as a substitute for avoiding an allergen.", check: "Cross-contact check: identify shared knives, boards, pans, cloths, storage and serving utensils. Keep allergen-free food sealed, labelled and separate; clean hands and equipment and prepare it first where practical." },
  { title: "Menus that still work at sea", body: "Plan balanced meals with suitable energy, protein, fruit or vegetables and hydration. Include pre-prepared, easy-to-eat choices for the first day and rough weather. For every meal, note its water, refrigeration, stove, fuel, cookware and preparation-time dependencies, then carry a safe no-cook alternative.", check: "Practical check: rehearse a rough-weather day. Can the crew eat safely if the stove cannot be used, a watchkeeper is seasick, or refrigeration or one ingredient is lost?" },
  { title: "Shelf life, inspection and rotation", body: "Storage life is item- and condition-specific: berries, leafy produce and ripe fruit usually deteriorate sooner than intact roots, onions or firm fruit, but heat, moisture, bruising, ventilation and ripeness can change that order. Use product instructions and observed condition, not a single “fresh food lasts” rule. Date and rotate stock first-expiring-first-out; inspect temperature-controlled food and produce regularly.", check: "Reject leaking, bulging, badly dented or rusted cans and torn, swollen, wet or unsealed packs. Discard food with unexpected odour, colour, texture, mould or temperature abuse; when safety is uncertain, do not taste it." },
  { title: "Potable water hygiene", body: "Use clean designated drinking-water tanks and containers. Inspect and maintain them to vessel guidance; keep fillers, caps, hoses and hands clean, prevent seawater, fuel, chemicals and waste entering, and use a known-safe supply or an appropriate treatment. Protect a separate emergency-water reserve and avoid dipping shared cups into containers.", check: "Contamination check: investigate a broken seal, dirty filler or hose, unusual taste, odour, colour, cloudiness or suspected backflow. Isolate suspect water and use the protected reserve until it is confirmed safe or correctly treated." },
  { title: "Secure, usable stowage", body: "Keep provisions dry, labelled and accessible without opening unsafe spaces at sea. Stow heavy items low, restrain everything against heel and violent movement, and record each item's location, quantity and expiry. Separate food and potable water from fuel, gas, cleaning products, waste, bilge water and other contamination sources; keep emergency water independent of the main supply.", check: "Practical check: imagine a knockdown, a leak and darkness. Nothing should move, crush a pipe or block access, and the inventory should let another crew member find food and emergency water quickly." },
  { title: "Waste and retained disposal", body: "Minimise waste through menu planning, sensible portions, low-packaging choices and reusable containers. Segregate and securely retain waste so it cannot leak, contaminate stores or escape overboard. Dispose of it ashore or otherwise only as permitted by the rules that apply to the vessel, location and waste type; never assume food waste or packaging may be discharged.", check: "Before departure, identify retained-waste capacity and the applicable disposal rules for the route and ports, including any stricter local requirements." },
] as const;

const sectionIds: Readonly<Record<(typeof topics)[number]["title"], string>> = {
  "Crew needs before menus": "victualling-crew-needs",
  "Menus that still work at sea": "victualling-menus",
  "Shelf life, inspection and rotation": "victualling-shelf-life",
  "Potable water hygiene": "victualling-water-hygiene",
  "Secure, usable stowage": "victualling-stowage",
  "Waste and retained disposal": "victualling-waste",
};

export const FoodWaterSafetyGuide = () => <Card className="mb-6">
  <CardHeader><CardTitle>Food, water and stowage safety</CardTitle></CardHeader>
  <CardContent className="grid gap-4 md:grid-cols-2">
    {topics.map((topic) => <section id={sectionIds[topic.title]} tabIndex={-1} key={topic.title} className="rounded-lg border p-4 space-y-2 scroll-mt-24">
      <h3 className="font-semibold">{topic.title}</h3>
      <p className="text-sm text-muted-foreground">{topic.body}</p>
      <p className="text-sm"><strong>Check:</strong> {topic.check}</p>
    </section>)}
    <section id="victualling-traceability" tabIndex={-1} className="rounded-lg border p-4 space-y-2 scroll-mt-24 md:col-span-2">
      <h3 className="font-semibold">Tin labels and traceability</h3>
      <p className="text-sm text-muted-foreground">Protect original labels from moisture. If a label cannot remain attached, keep a complete, legible record reliably tied to that exact tin: food name, ingredients and allergens, use-by or best-before date, preparation and storage instructions, and batch/lot or recall information. Writing only a product name on a tin is not an adequate replacement.</p>
      <p className="text-sm"><strong>Check:</strong> Another crew member must be able to identify, safely prepare and date-check the exact tin and act on a recall.</p>
    </section>
  </CardContent>
</Card>;
