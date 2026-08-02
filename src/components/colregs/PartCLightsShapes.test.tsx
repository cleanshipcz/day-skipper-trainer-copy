import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartCLights, PartCShapes, RULE_22_RANGES } from "./PartCLightsShapes";

describe("COLREG Part C safety-critical content", () => {
  it("preserves Rule 20 timing and the confusing-light prohibition", () => {
    render(<PartCLights />);
    expect(screen.getByText(/Rules 20–31 apply in all weathers/)).toBeTruthy();
    expect(screen.getByText(/sunset to sunrise; during that period show no other lights/)).toBeTruthy();
    expect(screen.getByText(/sunrise to sunset in restricted visibility/)).toBeTruthy();
  });

  it("preserves Rule 22 thresholds and ranges", () => {
    expect(RULE_22_RANGES).toEqual([
      { length: "50 m or more", masthead: "6", side: "3", stern: "3", towing: "3", allRound: "3" },
      { length: "12 m to under 50 m", masthead: "5*", side: "2", stern: "2", towing: "2", allRound: "2" },
      { length: "Under 12 m", masthead: "2", side: "1", stern: "2", towing: "2", allRound: "2" },
    ]);
  });

  it("preserves vessel thresholds and combined-lantern terminology", () => {
    render(<PartCLights />);
    expect(screen.getByText(/At 50 m or more it is required/)).toBeTruthy();
    expect(screen.getByText(/one lantern at or near the mast top where best seen—not a masthead light/)).toBeTruthy();
    expect(screen.getByText(/exceeding 200 m: three masthead lights/i)).toBeTruthy();
  });

  it("distinguishes Rule 24 towing, pushing and exceptional assistance", () => {
    render(<PartCLights />);
    expect(screen.getByText(/ordinary vessel\/object towed shows sidelights and a sternlight/)).toBeTruthy();
    expect(screen.getByText(/pusher\/tower alongside shows two vertical masthead lights, sidelights and sternlight/)).toBeTruthy();
    expect(screen.getByText(/second masthead light abaft and higher is required at 50 m or more/)).toBeTruthy();
    expect(screen.getByText(/under 25 m breadth shows all-round white near each end/)).toBeTruthy();
    expect(screen.getByText(/Rule 24\(h\)/)).toBeTruthy();
    expect(screen.getByText(/Rule 24\(i\)/)).toBeTruthy();
  });

  it("keeps NUC and RAM making-way requirements distinct", () => {
    render(<PartCLights />);
    expect(screen.getByText(/RAM making way through the water shows masthead light\(s\), sidelights and sternlight/)).toBeTruthy();
    expect(screen.getByText(/NUC making way adds sidelights and sternlight but no masthead-light requirement/)).toBeTruthy();
  });

  it("teaches Rule 26 supplementary fishing indications", () => {
    render(<PartCLights />);
    expect(screen.getByText(/shooting nets shows two all-round whites vertically/)).toBeTruthy();
    expect(screen.getByText(/hauling nets shows all-round white over red/)).toBeTruthy();
    expect(screen.getByText(/purse seiner hampered by its gear/)).toBeTruthy();
  });

  it("renders one coloured symbol for every light in a stated group", () => {
    render(<PartCLights />);
    const towingPlan = screen.getByText("Towing astern, tow 200 m or less").closest("figure")!;
    const verticalGroup = within(towingPlan).getByText("two masthead lights vertically").parentElement!;
    expect(verticalGroup.querySelectorAll('[data-light-colour="white"]')).toHaveLength(2);
    const cbdPlan = screen.getByText("Constrained by draught underway").closest("figure")!;
    const cbdGroup = within(cbdPlan).getByText("three all-round reds vertically").parentElement!;
    expect(cbdGroup.querySelectorAll('[data-light-colour="red"]')).toHaveLength(3);
  });

  it("shows the 50 m trawler masthead ahead but not astern", () => {
    render(<PartCLights />);
    const plan = screen.getByText("Trawling and making way").closest("figure")!;
    const ahead = within(plan).getByText("ahead").nextElementSibling!;
    const astern = within(plan).getByText("astern").nextElementSibling!;
    expect(within(ahead as HTMLElement).getByText("50 m+ masthead light")).toBeTruthy();
    expect(within(astern as HTMLElement).queryByText("50 m+ masthead light")).toBeNull();
  });

  it("provides text equivalents and separates mnemonics", () => {
    render(<><PartCLights /><PartCShapes /></>);
    expect(screen.getAllByText("Structured equivalent:").length).toBeGreaterThanOrEqual(18);
    expect(screen.getAllByText(/Memory aid/).length).toBe(2);
    expect(screen.getByText(/Mnemonics are explicitly labelled and have no legal force/)).toBeTruthy();
  });
});
