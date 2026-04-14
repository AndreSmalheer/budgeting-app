import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Potjes from "./Potjes";

vi.mock("../../utils/formatters", () => ({
  formatCurrency: (value) => `€${value}`,
}));

vi.mock("../../utils/icons", () => ({
  LucideIcon: () => <div data-testid="icon" />,
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Potjes component", () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it("renders name, balance and target correctly", () => {
    render(
      <MemoryRouter>
        <Potjes
          id="1"
          name="Vakantie"
          balance={100}
          targetAmount={200}
          icon="wallet"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Vakantie")).toBeInTheDocument();
    expect(screen.getByText("€100 van €200")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(
      <MemoryRouter>
        <Potjes
          id="1"
          name="Test"
          balance={0}
          targetAmount={100}
          icon="wallet"
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("navigates to details page when clicked", () => {
    render(
      <MemoryRouter>
        <Potjes
          id="42"
          name="Vakantie"
          balance={100}
          targetAmount={200}
          icon="wallet"
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Vakantie"));

    expect(navigateMock).toHaveBeenCalledWith("/budget-details/42");
  });

  it("applies mobile class on small screens", () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event("resize"));

    const { container } = render(
      <MemoryRouter>
        <Potjes
          id="1"
          name="Test"
          balance={0}
          targetAmount={100}
          icon="wallet"
        />
      </MemoryRouter>,
    );

    expect(container.firstChild.className).toContain("Mobile");
  });
});
