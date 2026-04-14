import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import BudgetDetails from "./BudgetDetails";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" })
  };
});

vi.mock("../../hooks/useSession", () => ({
  useSession: () => ({ id: "user-1" })
}));

vi.mock("../../utils/formatters", () => ({
  formatCurrency: (value) => `€${value}`,
  formatDate: () => "01-01-2025"
}));

vi.mock("../../services/api/client", () => ({
  createTransaction: vi.fn()
}));

vi.mock("../../components/BackBtn/BackBtn", () => ({
  default: () => <div>Back</div>
}));

vi.mock("../../components/budget/BudgetDetailsChart", () => ({
  default: () => <div data-testid="chart">chart</div>
}));

vi.mock("../../components/budget/BudgetTransactionsSection", () => ({
  default: () => <div>transactions</div>
}));

vi.mock("../../components/budget/BudgetWithdrawForm", () => ({
  default: () => <div>form</div>
}));

const potjes = [
  {
    id: "1",
    name: "Vakantie",
    targetAmount: 1000,
    currentBalance: 200,
    createdAt: "2025-01-01",
    icon: "wallet"
  }
];

const transacties = [];

describe("BudgetDetails", () => {
  it("shows loading state", () => {
    render(
      <MemoryRouter>
        <BudgetDetails
          potjes={potjes}
          transacties={transacties}
          isLoading={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Potje laden...")).toBeInTheDocument();
  });

  it("shows not found when potje does not exist", () => {
    render(
      <MemoryRouter>
        <BudgetDetails potjes={[]} transacties={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText("Potje niet gevonden.")).toBeInTheDocument();
  });

  it("renders budget details page when potje exists", () => {
    render(
      <MemoryRouter>
        <BudgetDetails potjes={potjes} transacties={transacties} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("chart")).toBeInTheDocument();
    expect(screen.getByText("form")).toBeInTheDocument();
    expect(screen.getByText("transactions")).toBeInTheDocument();
  });
});
