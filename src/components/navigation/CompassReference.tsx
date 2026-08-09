/* eslint-disable react-refresh/only-export-components -- source metadata is exported as the content-test contract */
import { Card, CardContent } from "@/components/ui/card";

export const COMPASS_SOURCES = [
  {
    label: "NOAA U.S. Coast Pilot 1, Chapter 1, revision 02 August 2026, Compass Roses paragraphs 134–135",
    href: "https://nauticalcharts.noaa.gov/publications/coast-pilot/files/cp1/CPB1_C01_WEB.pdf",
  },
  {
    label: "UK MCA MGN 610 (M+F), Amendment 1 (20 November 2024)",
    href: "https://www.gov.uk/government/publications/mgn-610-mf-amendment-1-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020/mgn-610-mf-amendment-1-navigation-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020",
  },
] as const;

const CompassRose = () => (
  <figure className="space-y-3">
    <svg viewBox="0 0 360 360" role="img" aria-labelledby="rose-title rose-desc" className="mx-auto w-full max-w-sm rounded-lg border bg-sky-50 text-slate-900">
      <title id="rose-title">Nautical chart compass rose</title>
      <desc id="rose-desc">A true outer rose and magnetic inner rose. The note reads variation 4 degrees 30 minutes west in 2020, annual decrease 6 minutes.</desc>
      <circle cx="180" cy="180" r="145" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="180" cy="180" r="105" fill="none" stroke="currentColor" />
      {Array.from({ length: 12 }, (_, index) => <line key={index} x1="180" y1="35" x2="180" y2="49" stroke="currentColor" transform={`rotate(${index * 30} 180 180)`} />)}
      <path d="M180 50 166 180 180 310 194 180Z" fill="#0f766e" opacity=".75" />
      <path d="M168 76 154 180 168 284 182 180Z" fill="#dc2626" opacity=".75" transform="rotate(-4.5 180 180)" />
      <text x="180" y="28" textAnchor="middle" fontWeight="700">TRUE N</text>
      <text x="180" y="329" textAnchor="middle" fontSize="12">MAGNETIC: 4°30′W (2020)</text>
      <text x="180" y="345" textAnchor="middle" fontSize="12">ANNUAL DECREASE 6′</text>
    </svg>
    <figcaption className="text-sm text-muted-foreground">Training facsimile, not for navigation. The outer ring is true; the offset inner arrow and dated note supply magnetic variation.</figcaption>
  </figure>
);

const DeviationCurve = () => (
  <figure className="space-y-3">
    <svg viewBox="0 0 520 260" role="img" aria-labelledby="curve-title curve-desc" className="w-full rounded-lg border bg-card text-foreground">
      <title id="curve-title">Example vessel deviation curve</title>
      <desc id="curve-desc">Deviation by compass heading: 000 two degrees west, 045 four west, 090 five west, 135 three west, 180 zero, 225 three east, 270 five east, 315 two east, returning to 000 two west.</desc>
      <line x1="52" y1="130" x2="500" y2="130" stroke="currentColor" />
      <line x1="52" y1="25" x2="52" y2="232" stroke="currentColor" />
      {[0,45,90,135,180,225,270,315,360].map((h, i) => <g key={h}><line x1={52+i*56} y1="126" x2={52+i*56} y2="134" stroke="currentColor"/><text x={52+i*56} y="151" textAnchor="middle" fontSize="11">{String(h).padStart(3,"0")}°C</text></g>)}
      <text x="13" y="43" fontSize="12">E +5°</text><text x="14" y="226" fontSize="12">W −5°</text>
      <polyline points="52,166 108,202 164,220 220,184 276,130 332,76 388,40 444,94 500,166" fill="none" stroke="#dc2626" strokeWidth="4" />
      {["52,166","108,202","164,220","220,184","276,130","332,76","388,40","444,94","500,166"].map((point) => { const [cx,cy]=point.split(","); return <circle key={point} cx={cx} cy={cy} r="5" fill="#dc2626"/>; })}
    </svg>
    <figcaption className="text-sm text-muted-foreground">Example only. Use the dated card or curve belonging to the actual compass; its index is compass heading (°C).</figcaption>
  </figure>
);

const CompassReference = () => <div className="space-y-8">
  <section aria-labelledby="variation-heading" className="space-y-4">
    <h2 id="variation-heading" className="text-2xl font-semibold">Read variation from the chart</h2>
    <div className="grid gap-6 md:grid-cols-2"><CompassRose/><div className="space-y-3">
      <p><strong>Variation</strong> is the angle between true and magnetic north at a place. Use the rose or variation note nearest the route, then update its stated epoch to the date of the passage.</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Read the epoch variation and whether the annual change increases or decreases it.</li>
        <li>Multiply annual change by years since the epoch, keeping minutes until the end.</li>
        <li>Apply that change to the epoch value, then sense-check against a current, corrected chart or ENC.</li>
      </ol>
      <Card><CardContent className="pt-6 text-sm"><h3 className="font-semibold">Worked update for 2026</h3><p>Rose: 4°30′W (2020), annual decrease 6′. Six years × 6′ = 36′ decrease. Current variation = 4°30′W − 0°36′ = <strong>3°54′W</strong>. This is a teaching example; use today’s chart and voyage date.</p></CardContent></Card>
    </div></div>
  </section>

  <section aria-labelledby="deviation-heading" className="space-y-4">
    <h2 id="deviation-heading" className="text-2xl font-semibold">Use the vessel’s deviation card</h2>
    <div className="grid gap-6 md:grid-cols-2"><DeviationCurve/><div className="space-y-3">
      <p><strong>Deviation</strong> is the error produced by the vessel’s magnetic fields. It varies with compass heading and belongs to one compass in one equipment state.</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Index the card by <strong>compass heading</strong>, never true heading.</li>
        <li>For an in-between heading, linearly interpolate between adjacent entries. Across north, treat 000° as 360°.</li>
        <li>For T→C, the required compass heading is initially unknown: estimate C, read/interpolate deviation at that C, recalculate, and repeat until stable.</li>
        <li>Frequently check observed compass error and update the record. Re-check after major course alterations and after structural work, magnetic cargo, or electrical/magnetic equipment is added, removed, or moved.</li>
      </ol>
    </div></div>
  </section>

  <section aria-labelledby="procedure-heading" className="space-y-4">
    <h2 id="procedure-heading" className="text-2xl font-semibold">A neutral conversion procedure</h2>
    <p>Assign signs first: <strong>east is positive (+), west is negative (−)</strong>. Going C→M→T, add deviation then variation: M = C + D; T = M + V. Going T→M→C, subtract variation then deviation: M = T − V; C = M − D. Normalize only after each calculation: add or subtract 360° until the result is 000°–359°.</p>
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardContent className="space-y-2 pt-6"><h3 className="font-semibold">Worked C→M→T (wraps north)</h3><p>Compass heading 358°C; card deviation 3°E (+3°); current variation 4°W (−4°).</p><p>M = 358° + (+3°) = 361° → <strong>001°M</strong></p><p>T = 001° + (−4°) = −3° → <strong>357°T</strong></p></CardContent></Card>
      <Card><CardContent className="space-y-2 pt-6"><h3 className="font-semibold">Worked T→M→C (wraps north)</h3><p>True course 002°T; variation 5°E (+5°); deviation at the solved compass heading is 2°W (−2°).</p><p>M = 002° − (+5°) = −3° → <strong>357°M</strong></p><p>C = 357° − (−2°) = 359° → <strong>359°C</strong>. Confirm −2° deviation at 359°C on the card.</p></CardContent></Card>
    </div>
    <aside className="rounded-lg border bg-muted/30 p-4 space-y-2"><h3 className="font-semibold">Headings, courses and bearings are different</h3><p>A <strong>heading</strong> is the direction in which the vessel’s bow points. A <strong>course</strong> is a direction of travel; when planning, the <strong>course to steer</strong> (CTS) is the heading-to-maintain calculated to achieve the desired track after allowing for effects such as current and leeway. <strong>Course made good</strong> is the actual direction of travel over the ground between two positions.</p><p>Wind and current can make desired track and course made good differ from the heading to steer. Label the reference: after a true CTS is converted through T→M→C, the resulting <strong>compass CTS is the compass heading/course the helm maintains</strong>.</p><p>A deviation card is indexed by the current estimated or actual <strong>compass heading</strong>. During T→M→C conversion, use the current compass-heading iteration estimate to read deviation, then recalculate until stable. Never index the card with an unconverted true or magnetic plotted course, CTS, or course made good.</p><p>A <strong>bearing</strong> is the direction from the observer to an object. Headings, courses, and bearings may each use true, magnetic, or compass reference, so label every value and convert like-for-like before comparing them.</p></aside>
  </section>

  <section aria-labelledby="sources-heading" className="space-y-2 text-sm">
    <h2 id="sources-heading" className="text-xl font-semibold">Authoritative sources</h2>
    <p>Accessed 9 August 2026. NOAA Coast Pilot 1, revision 02 August 2026, paragraphs 134–135 states that chart compass roses show their date, magnetic variation and annual change. The Coast Pilot is updated weekly, so verify the displayed revision when following the link. MCA guidance requires a residual-deviation table or curve, regular checks, and adjustment after changes that can affect magnetism.</p>
    <ul className="list-disc pl-5">{COMPASS_SOURCES.map((source) => <li key={source.href}><a className="text-primary underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
  </section>
</div>;

export default CompassReference;
