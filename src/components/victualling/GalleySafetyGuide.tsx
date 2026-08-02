import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GalleySafetyGuide = () => <>
  <Card className="mb-6 border-2 border-primary/20">
    <CardHeader><CardTitle>Safe galley and LPG plan</CardTitle></CardHeader>
    <CardContent className="space-y-4 text-sm">
      <p>Match the menu to the vessel's approved appliance and compatible fuel. Calculate demand from measured consumption, planned cooking and contingency, then compare it with usable compatible capacity. Use only cylinders, regulators, hoses, connections and storage approved for the installation; follow the vessel's procedures, manufacturer instructions and applicable rules. Never improvise adapters, refill arrangements, indoor cylinder storage or an unapproved stove or fuel.</p>
      <div><h3 className="font-semibold">Before use</h3><p className="text-muted-foreground">Check approved cylinder stowage, restraints, locker drain and vent path, hoses, connections, isolation controls, flame-failure devices and detectors as the vessel instructions require. Keep ventilation open, combustibles clear and the correct fire blanket or extinguisher accessible without reaching across a fire. If anything is damaged, out of date, incompatible or uncertain, isolate it and obtain competent advice.</p></div>
      <div><h3 className="font-semibold">Leak or alarm response</h3><p className="text-muted-foreground">Do not light a flame or operate electrical switches or engines. If it is safe, shut off the supply at its designated isolation point, evacuate as necessary, ventilate naturally from outside, and follow the vessel emergency procedure. Do not use the system again until the cause is found and made safe by a competent person. Never search for a leak with a flame.</p></div>
      <div><h3 className="font-semibold">Cooking underway</h3><p className="text-muted-foreground">Use gimbals, locks and pot restraints as designed for the conditions; do not leave a flame unattended. Turn handles inward, avoid overfilled pans and hot liquids in rough weather, wear protective clothing and keep another crew member aware. Shut off according to the vessel procedure after use and maintain ventilation. Prefer prepared cold food or a safe no-cook menu when motion makes cooking unsafe—never improvise a barbecue, camping stove or open flame below decks.</p></div>
      <p><Link className="font-medium text-primary underline underline-offset-4" to="/safety/gas?from=victualling">Continue to dedicated Gas Safety theory <span className="sr-only">and return to Victualling afterward</span></Link>.</p>
    </CardContent>
  </Card>
  <Card className="mb-6">
    <CardHeader><CardTitle>Provisioning is not the vessel safety inventory</CardTitle></CardHeader>
    <CardContent className="space-y-3 text-sm">
      <p>Victualling covers food, potable water, galley consumables and their stowage. Complete the dedicated pre-departure and safety checks separately. First-aid contents, crew medication and medical advice must fit the crew and passage and follow professional advice where needed. Sun protection and clothing must fit each person and expected conditions. Pyrotechnic carriage, type, service life and disposal depend on vessel requirements, manufacturer instructions and applicable rules—an “in date” label alone is not a complete check.</p>
      <p><Link className="font-medium text-primary underline underline-offset-4" to="/passage-planning/checklist?from=victualling">Open the dedicated pre-departure checklist <span className="sr-only">and return to Victualling afterward</span></Link>.</p>
    </CardContent>
  </Card>
</>;
