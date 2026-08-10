import type { FlareId } from "@/data/flareTypes";

const plates: Record<FlareId, { form: string; purpose: string; activation: string; pictogram: string; shape: "rocket" | "hand" | "smoke" | "buoyant"; colour: string }> = {
  "red-parachute-rocket": { form: "Long launcher", purpose: "LONG-RANGE DISTRESS", activation: "FIRING END ↑ · HOLD BELOW LINE · READ LAUNCH STEPS", pictogram: "parachute over red star", shape: "rocket", colour: "#dc2626" },
  "red-hand-flare": { form: "Hand-held light", purpose: "CLOSE-RANGE DISTRESS", activation: "BURNING END ↑ · GRIP ZONE · READ IGNITION STEPS", pictogram: "red flame above hand", shape: "hand", colour: "#dc2626" },
  "orange-smoke-hand": { form: "Hand smoke", purpose: "DAY POSITION MARKER", activation: "SMOKE OUTLET ↑ · GRIP ZONE · READ ACTIVATION STEPS", pictogram: "orange cloud above hand", shape: "smoke", colour: "#f97316" },
  "orange-smoke-buoyant": { form: "Floating smoke", purpose: "DAY WATER MARKER", activation: "OUTLET ↑ · WATERLINE · READ DEPLOYMENT STEPS", pictogram: "orange cloud above waves", shape: "buoyant", colour: "#f97316" },
  "white-hand-flare": { form: "Hand-held light", purpose: "COLLISION WARNING", activation: "BURNING END ↑ · GRIP ZONE · READ IGNITION STEPS", pictogram: "white star above hand", shape: "hand", colour: "#f8fafc" },
};

export function FlareSchematic({ id, label }: { id: FlareId; label: string }) {
  const plate = plates[id];
  const buoyant = plate.shape === "buoyant";
  const x = buoyant ? 120 : plate.shape === "rocket" ? 145 : 138;
  const width = buoyant ? 80 : plate.shape === "rocket" ? 30 : 52;
  return (
    <figure className="rounded-md border bg-slate-950 p-3" data-schematic={id} data-form={plate.form} data-purpose={plate.purpose} data-pictogram={plate.pictogram}>
      <svg viewBox="0 0 420 210" role="img" aria-labelledby={`${id}-title ${id}-desc`} className="h-52 w-full">
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-desc`}>{plate.form}; purpose: {plate.purpose}; pictogram: {plate.pictogram}; {plate.activation}; example expiry marking EXP 2029-06. Generic teaching plate only: casing and mechanism vary; read the device.</desc>
        <text x="12" y="18" fill="#e2e8f0" fontSize="11">GENERIC RECOGNITION PLATE — NOT A MAKER CASING</text>
        <text x="12" y="38" fill="#f8fafc" fontWeight="700" fontSize="15">{plate.purpose}</text>
        <text x="12" y="56" fill="#cbd5e1" fontSize="12">FORM: {plate.form}</text>
        {plate.shape === "rocket" && <path d="M160 72c-27-17-44 0-44 20m44-20c27-17 44 0 44 20" fill="none" stroke="#e2e8f0" strokeWidth="3" />}
        {(plate.shape === "hand" || plate.shape === "rocket") && <path d="M160 85l-15-24m15 24 16-23m-16 23V53" stroke={plate.colour} strokeWidth="7" strokeLinecap="round" />}
        {(plate.shape === "smoke" || plate.shape === "buoyant") && <path d="M165 86c35-36 65 13 101-22m-101 40c42-24 72 22 112-2" fill="none" stroke={plate.colour} strokeWidth="13" strokeLinecap="round" />}
        <rect x={x} y="92" width={width} height={buoyant ? 70 : plate.shape === "rocket" ? 100 : 82} rx="6" fill={plate.colour} stroke="#e2e8f0" strokeWidth="3" />
        {!buoyant && <rect x={x + 5} y="145" width={width - 10} height="24" fill="#334155" stroke="#94a3b8" />}
        <path d={`M${x - 10} 88h${width + 20}m-5-5 5 5-5 5`} stroke="#facc15" strokeWidth="3" fill="none" />
        {buoyant && <path d="M60 170c50-14 85 14 130 0 45-14 85 14 170 0" fill="none" stroke="#38bdf8" strokeWidth="6" />}
        <rect x="290" y="72" width="115" height="42" rx="4" fill="#f8fafc" />
        <text x="300" y="88" fill="#0f172a" fontSize="11">EXPIRY EXAMPLE</text><text x="300" y="105" fill="#0f172a" fontWeight="700" fontSize="15">EXP 2029-06</text>
        <text x="12" y="202" fill="#fde68a" fontSize="11">{plate.activation}</text>
      </svg>
      <figcaption className="mt-2 space-y-1 text-xs text-slate-200"><span className="block font-semibold">{label}</span><span className="block">{plate.form} · {plate.purpose} · pictogram: {plate.pictogram}.</span><span className="block">{plate.activation}. “EXP 2029-06” is an expiry-marking example, not this device’s date. Appearance is not standardised; identify printed type and follow its instructions.</span></figcaption>
    </figure>
  );
}
