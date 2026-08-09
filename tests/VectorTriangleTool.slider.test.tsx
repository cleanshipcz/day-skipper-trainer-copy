import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import VectorTriangleTool from "@/pages/VectorTriangleTool";

vi.mock("@/hooks/useCompletion", () => ({ useCompletion: () => ({ completeTopic: vi.fn() }) }));

describe("VectorTriangleTool shared Slider integration", () => {
  it("retains keyboard value changes for an existing unnamed slider consumer", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><VectorTriangleTool /></MemoryRouter>);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(4);
    expect(sliders[0].getAttribute("aria-valuenow")).toBe("90");
    sliders[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(sliders[0].getAttribute("aria-valuenow")).toBe("91");
    expect(screen.getByText("91°")).toBeTruthy();
  });
});
