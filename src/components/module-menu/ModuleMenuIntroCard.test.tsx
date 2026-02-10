import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Compass } from "lucide-react";
import { ModuleMenuIntroCard } from "./ModuleMenuIntroCard";

describe("ModuleMenuIntroCard", () => {
  it("renders shared intro card structure", () => {
    const html = renderToStaticMarkup(
      <ModuleMenuIntroCard icon={Compass} title="Safety at Sea" description="COLREGs foundations" />,
    );

    expect(html).toContain("Safety at Sea");
    expect(html).toContain("COLREGs foundations");
    expect(html).toContain("mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent");
    expect(html).toContain("p-3 rounded-full bg-primary/10");
    expect(html).toContain("w-6 h-6 text-primary");
  });

  it("allows class customization for page-specific color systems", () => {
    const html = renderToStaticMarkup(
      <ModuleMenuIntroCard
        icon={Compass}
        title="Tides"
        description="Blue variant"
        className="border-blue-500/20"
        iconContainerClassName="bg-blue-500/10"
        iconClassName="text-blue-500"
      />,
    );

    expect(html).toContain("border-blue-500/20");
    expect(html).toContain("bg-blue-500/10");
    expect(html).toContain("text-blue-500");
  });
});
