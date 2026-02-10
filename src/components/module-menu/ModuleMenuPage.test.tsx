import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Ship } from "lucide-react";
import { ModuleMenuPage } from "./ModuleMenuPage";
import type { ModuleMenuItem } from "./types";

vi.mock("@/components/CompletionBadge", () => ({
  CompletionBadge: () => null,
}));

const modules: ModuleMenuItem[] = [
  {
    id: "sample-module",
    title: "Sample",
    description: "Sample description",
    icon: Ship,
    path: "/sample",
    type: "learn",
    color: "from-blue-500 to-cyan-500",
  },
];

describe("ModuleMenuPage", () => {
  it("renders the shared page shell with intro and trailing sections", () => {
    const html = renderToStaticMarkup(
      <ModuleMenuPage
        title="Navigation"
        subtitle="Foundations"
        modules={modules}
        onBack={() => {}}
        onNavigate={() => {}}
        introCard={<section data-testid="intro">Intro</section>}
        afterGrid={<section data-testid="after-grid">After</section>}
      />,
    );

    expect(html).toContain("Navigation");
    expect(html).toContain("Foundations");
    expect(html).toContain('data-testid="intro"');
    expect(html).toContain('data-testid="after-grid"');
    expect(html).toContain("Sample");
  });

  it("applies standardized default container classes", () => {
    const html = renderToStaticMarkup(
      <ModuleMenuPage title="Navigation" subtitle="Foundations" modules={modules} onBack={() => {}} onNavigate={() => {}} />,
    );

    expect(html).toContain("min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background");
    expect(html).toContain("container mx-auto px-4 py-8");
  });
});
