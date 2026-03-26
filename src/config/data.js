export const transacties = [
  {
    id: "t1",
    amount: 25.5,
    type: "expense",
    category: "food",
    description: "Boodschappen Albert Heijn",
    date: "2026-03-20",
    potjeId: "p1"
  },
  {
    id: "t2",
    amount: 1200,
    type: "income",
    category: "salary",
    description: "Salaris maart",
    date: "2026-03-01",
    potjeId: null
  },
  {
    id: "t3",
    amount: 12.99,
    type: "expense",
    category: "entertainment",
    description: "Netflix",
    date: "2026-03-10",
    potjeId: "p3"
  },
  {
    id: "t4",
    amount: 40,
    type: "expense",
    category: "transport",
    description: "Treinkaartje",
    date: "2026-03-18",
    potjeId: "p2"
  }
];

export const potjes = [
  {
    id: "p1",
    name: "Boodschappen",
    budget: 300,
    icon: "shopping-cart",
  },
  {
    id: "p2",
    name: "Transport",
    budget: 100,
    icon: "car",
  },
  {
    id: "p3",
    name: "Abonnementen",
    budget: 50,
    icon: "credit-card",
  }
];
