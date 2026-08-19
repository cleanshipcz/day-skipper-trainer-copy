import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gasUserRoutine, gasWorkBoundaries } from "@/data/gasSafety";

export const MarineLpgInstallationGuide = () => (
  <div className="space-y-6">
    <figure className="rounded-lg border bg-muted/30 p-4" aria-labelledby="marine-lpg-caption">
      <div className="overflow-x-auto" tabIndex={0} aria-label="Scrollable example LPG installation drawing">
      <svg viewBox="0 0 900 310" role="img" aria-labelledby="marine-lpg-title marine-lpg-desc" className="h-auto min-w-[760px] w-full">
        <title id="marine-lpg-title">Annotated example marine LPG installation arrangement</title>
        <desc id="marine-lpg-desc">A secured upright vapour-withdrawal cylinder in an outside-access draining locker supplies a marine regulator and bubble tester, followed in this example by an installation-specific secondary isolation. Fixed pipe then divides into separate labelled closing devices for a flame-supervised cooker and heater. Fixed ventilation serves the appliance space. The cylinder valve remains the main supply isolation.</desc>
        <g fill="none" stroke="currentColor" strokeWidth="3">
          <rect x="15" y="30" width="235" height="230" rx="10" />
          <rect x="45" y="95" width="70" height="105" rx="14" />
          <path d="M80 95V72M65 72h30M115 145h70M185 125v40M185 145h80M265 125v40M265 145h75M340 125v40M340 145h75M415 145h65M480 145V85h75M480 145v70h75" />
          <rect x="555" y="55" width="130" height="60" rx="8" />
          <rect x="555" y="185" width="130" height="60" rx="8" />
          <path d="M700 60h170M700 75h170M700 205h170M700 220h170" strokeDasharray="9 7" />
          <path d="M35 220h195l35 35" />
        </g>
        <g fill="currentColor" fontSize="15">
          <text x="28" y="55" fontWeight="700">Outside-access locker</text><text x="39" y="284">Low-point drain → overboard</text>
          <text x="32" y="218">upright + secured</text><text x="126" y="118">Marine regulator</text>
          <text x="238" y="112">bubble tester</text><text x="310" y="112">optional secondary tap</text>
          <text x="422" y="132">fixed pipe branches</text><text x="560" y="48">labelled closing device</text>
          <text x="584" y="90">cooker + FSD</text><text x="560" y="178">labelled closing device</text>
          <text x="585" y="220">heater + FSD</text><text x="705" y="48">fixed ventilation kept clear</text>
        </g>
      </svg></div>
      <ol aria-label="Installation sequence in text" className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <li className="rounded border p-2"><strong>1. Supply:</strong> upright, secured vapour-withdrawal cylinder; its cylinder valve is the main supply isolation.</li>
        <li className="rounded border p-2"><strong>2. Locker equipment:</strong> matched marine regulator and fitted bubble tester; a secondary tap or solenoid exists only where the installation provides one.</li>
        <li className="rounded border p-2"><strong>3. Distribution:</strong> fixed pipe divides into a separate branch and closing device for each appliance.</li>
        <li className="rounded border p-2"><strong>4. Appliances:</strong> marine/LPG-suitable, flame-supervised appliances installed to their instructions, with fixed ventilation kept clear.</li>
      </ol>
      <figcaption id="marine-lpg-caption" className="mt-3 text-sm text-muted-foreground">Concept only—not a construction drawing. A competent boat-LPG person must design, install and test the actual system to the applicable requirements and manufacturers' instructions.</figcaption>
    </figure>

    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Practical pre-use checklist</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-2 pl-5 text-sm">{gasUserRoutine.preUse.map(item => <li key={item}>{item}</li>)}</ol></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Practical shutdown checklist</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-2 pl-5 text-sm">{gasUserRoutine.shutdown.map(item => <li key={item}>{item}</li>)}</ol></CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle className="text-base">Who may do what?</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><strong>User routine:</strong> {gasWorkBoundaries.user}</p><p><strong>Competent-person work:</strong> {gasWorkBoundaries.competent}</p><p><strong>Rented and in-scope boats:</strong> {gasWorkBoundaries.rentedBoat}</p></CardContent></Card>
  </div>
);
