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
    createdAt: "2026-03-27T10:00:00Z",
  },
  {
    id: "p2",
    name: "Transport",
    budget: 100,
    icon: "car",
    createdAt: "2026-03-26T12:00:00Z",
  },
  {
    id: "p3",
    name: "Abonnementen",
    budget: 50,
    icon: "credit-card",
    createdAt: "2026-03-25T09:00:00Z",
  },
  {
    id: "p4",
    name: "Uitgaan",
    budget: 150,
    icon: "party-popper",
    createdAt: "2026-03-24T18:00:00Z",
  },
  {
    id: "p5",
    name: "Kleding",
    budget: 200,
    icon: "shirt",
    createdAt: "2026-03-23T14:00:00Z",
  },
  {
    id: "p6",
    name: "Sport",
    budget: 80,
    icon: "dumbbell",
    createdAt: "2026-03-22T16:00:00Z",
  },
  {
    id: "p7",
    name: "Gaming",
    budget: 120,
    icon: "gamepad",
    createdAt: "2026-03-21T20:00:00Z",
  },
  {
    id: "p8",
    name: "Gezondheid",
    budget: 90,
    icon: "heart",
    createdAt: "2026-03-20T11:00:00Z",
  },
  {
    id: "p9",
    name: "Huis",
    budget: 400,
    icon: "home",
    createdAt: "2026-03-19T08:00:00Z",
  },
  {
    id: "p10",
    name: "Sparen",
    budget: 500,
    icon: "piggy-bank",
    createdAt: "2026-03-18T09:00:00Z",
  },
];
