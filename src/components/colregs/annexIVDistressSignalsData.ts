export type DistressSignal = {
  id: string;
  medium: "Visual / pyrotechnic" | "Sound / text" | "Radio / beacon";
  title: string;
  recognition: string;
  equivalent?: string;
  boundary?: string;
};

// Recognition data is kept separate from rendering so omissions and safety-critical
// qualifiers can be tested without coupling the tests to card layout.
export const ANNEX_IV_DISTRESS_SIGNALS: readonly DistressSignal[] = [
  { id: "explosive", medium: "Sound / text", title: "Gun or explosive signal", recognition: "One signal at intervals of about one minute.", boundary: "Recognition only: do not improvise or carry explosive signals outside applicable carriage and safety requirements." },
  { id: "fog-apparatus", medium: "Sound / text", title: "Fog-signalling apparatus", recognition: "Continuous sounding — not the periodic Rule 35 fog patterns." },
  { id: "red-stars", medium: "Visual / pyrotechnic", title: "Rockets or shells throwing red stars", recognition: "Fired one at a time at short intervals." },
  { id: "sos", medium: "Sound / text", title: "SOS in Morse code", recognition: "Made by any signalling method.", equivalent: "••• ——— •••" },
  { id: "mayday", medium: "Sound / text", title: "MAYDAY", recognition: "The spoken word “MAYDAY” sent by radiotelephony; it is not merely text displayed on a vessel." },
  { id: "nc", medium: "Visual / pyrotechnic", title: "International Code flags N over C", recognition: "The International Code Signal of distress: N above C.", equivalent: "N: blue-and-white checks; C: blue-white-red-white-blue horizontal bands." },
  { id: "flag-ball", medium: "Visual / pyrotechnic", title: "Square flag and ball", recognition: "A square flag with a ball, or anything resembling a ball, above or below it.", equivalent: "The ball may be either above or below the square flag; both elements are required." },
  { id: "flames", medium: "Visual / pyrotechnic", title: "Flames on the vessel", recognition: "Flames such as those from a burning tar or oil barrel." , boundary: "Recognition only: never start a fire as a training exercise." },
  { id: "red-flares", medium: "Visual / pyrotechnic", title: "Red rocket-parachute flare or red hand flare", recognition: "Either a rocket-parachute flare or a hand flare showing a red light is a distress signal.", boundary: "Do not infer firing direction, range, duration or handling from this recognition lesson. Use only the instructions printed on the exact approved device and formal practical training." },
  { id: "orange-smoke", medium: "Visual / pyrotechnic", title: "Orange smoke", recognition: "A smoke signal giving off orange-coloured smoke.", boundary: "Recognition is not deployment instruction; follow the exact device label and approved practical training." },
  { id: "arms", medium: "Visual / pyrotechnic", title: "Outstretched-arm signal", recognition: "Slowly and repeatedly raise and lower both arms outstretched to each side.", equivalent: "Both arms move slowly and repeatedly; ordinary waving is not the prescribed description." },
  { id: "dsc", medium: "Radio / beacon", title: "Digital selective calling (DSC) distress alert", recognition: "VHF channel 70, or MF/HF on 2187.5, 4207.5, 6312, 8414.5, 12577 or 16804.5 kHz." , boundary: "Recognition only. Distress-button holds, menus and follow-up voice procedures vary by equipment and service: use the radio manufacturer’s manual and current operator training." },
  { id: "satellite", medium: "Radio / beacon", title: "Ship-to-shore satellite distress alert", recognition: "Sent by the ship’s Inmarsat or other mobile-satellite-service-provider ship earth station.", boundary: "Use the fitted terminal’s approved manual and current GMDSS training; this card is not an operating sequence." },
  { id: "epirb", medium: "Radio / beacon", title: "EPIRB signal", recognition: "Signals transmitted by an emergency position-indicating radio beacon (EPIRB).", boundary: "Activation, self-test, registration and cancellation are device- and administration-specific. Follow the beacon label/manual and flag-state or national authority training." },
  { id: "radio-systems", medium: "Radio / beacon", title: "Other approved radiocommunication signals", recognition: "Approved signals transmitted by radiocommunication systems, including survival-craft radar transponders (SARTs).", boundary: "SART is not a generic distress button. Learn operation and radar presentation using the exact approved equipment, its manual and current GMDSS/SAR training." },
] as const;

export const ANNEX_IV_ADDITIONAL_LOCATION_SIGNALS = [
  "Orange-coloured canvas bearing a black square and circle, or another appropriate symbol, for identification from the air.",
  "A dye marker.",
] as const;

export const ANNEX_IV_SOURCE_REVIEW = {
  ruleVersion: "USCG Navigation Rules and Regulations Handbook, corrected 8 August 2024",
  reviewedOn: "2026-08-03",
  ruleUrl: "https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf",
  annexUrl: "https://www.navcen.uscg.gov/annexiv-international-distress-signals",
  imoUrl: "https://www.imo.org/en/about/conventions/pages/colreg.aspx",
} as const;
