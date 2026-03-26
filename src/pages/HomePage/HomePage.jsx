import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Potjes from "../../components/Potjes/Potjes";
import Header from "../../components/Header/Header";
import "./HomePage.css";

const SPENDING_DATA = [
  { name: "Home", value: 875 },
  { name: "Food", value: 625 },
  { name: "Transport", value: 375 },
  { name: "Entertainment", value: 375 },
  { name: "Other", value: 250 },
];

const COLORS = ["#534AB7", "#1D9E75", "#EF9F27", "#D4537E", "#888780"];

const TRANSACTIONS = [
  {
    name: 'Rent',
    category: 'Home',
    date: 'Mar 24',
    amount: -950,
    iconBg: '#EEEDFE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#3C3489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke="#3C3489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Groceries',
    category: 'Food',
    date: 'Mar 23',
    amount: -84,
    iconBg: '#E1F5EE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#085041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="6" x2="21" y2="6" stroke="#085041" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 10a4 4 0 01-8 0" stroke="#085041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'NS Train',
    category: 'Transport',
    date: 'Mar 22',
    amount: -14,
    iconBg: '#FAEEDA',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="3" width="15" height="13" rx="2" stroke="#633806" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 8h4l3 3v5h-7V8z" stroke="#633806" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="#633806" strokeWidth="2"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="#633806" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    name: 'Netflix',
    category: 'Entertainment',
    date: 'Mar 21',
    amount: -18,
    iconBg: '#FBEAF0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polygon points="23 7 16 12 23 17 23 7" stroke="#72243E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke="#72243E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Salary',
    category: 'Income',
    date: 'Mar 20',
    amount: 2400,
    iconBg: '#E1F5EE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="#085041" strokeWidth="2" strokeLinecap="round"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#085041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function SpendingChart() {
  return (
    <div className="SpendingChart">
      <div className="Graph">
        <PieChart width={145} height={128}>
          <Pie
            data={SPENDING_DATA}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {SPENDING_DATA.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => `€${v.toLocaleString("nl-NL")}`}
            contentStyle={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </PieChart>
      </div>
    </div>
  );
}

function RecentTransactions() {
  return (
    <div className="SpendingOverview">
      <div className="recent-transactions__header">
        <h2 className="recent-transactions__title">Recent</h2>
        {/* <h2 className="recent-transactions__see-all">See All</h2> */}
      </div>
      <div className="recent-transactions">
        {TRANSACTIONS.map((t, i) => (
          <div key={i} className="transaction">
            <div className="transaction__icon" style={{ background: t.iconBg }}>
              {t.icon}
            </div>
            <div className="transaction__info">
              <p className="transaction__name">{t.name}</p>
              <p className="transaction__meta">
                {t.category} · {t.date}
              </p>
            </div>
            <span
              className={`transaction__amount ${t.amount < 0 ? "negative" : "positive"}`}
            >
              {t.amount < 0 ? "-" : "+"}€
              {Math.abs(t.amount).toLocaleString("nl-NL")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 650);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 650);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Header />
      {isMobile ? (
        <>
          <div className="Balance-container Mobile">
            <div>
              <h1>Balance</h1>
              <div className="Balance-items">
                <div className="Balance-item positive">
                  <span className="Balance-icon"></span>
                  <h2 className="Balance-value">200</h2>
                </div>
                <div className="Balance-item negative">
                  <span className="Balance-icon"></span>
                  <h2 className="Balance-value">300</h2>
                </div>
              </div>
            </div>
            <SpendingChart />
          </div>

          <div className="budget-container Mobile">
            <div className="budget-header">
              <h1 className="budget-title">Budget</h1>
              {/* <h2 className="budget-link">See all</h2> */}
            </div>
            <div className="budget-items">
              <Potjes className="budget-item" id="1" progress={20} />
              <Potjes className="budget-item" id="2" progress={60} />
            </div>
          </div>

        <RecentTransactions />
        </>
      ) : (
        <h1>Desktop placeholder</h1>
      )}
    </>
  );
}

export default HomePage;
