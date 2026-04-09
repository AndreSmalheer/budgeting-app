export const TRANSACTION_CATEGORIES = [
  { value: "overig", label: "Overig" },
  { value: "boodschappen", label: "Boodschappen" },
  { value: "sparen", label: "Sparen" },
  { value: "kleding", label: "Kleding" },
  { value: "school", label: "School" },
  { value: "vervoer", label: "Vervoer" },
  { value: "uitgaan", label: "Uitgaan" },
  { value: "gezondheid", label: "Gezondheid" },
  { value: "abonnementen", label: "Abonnementen" },
];

export function getTransactionCategoryLabel(categoryValue) {
  return (
    TRANSACTION_CATEGORIES.find((category) => category.value === categoryValue)?.label ||
    "Overig"
  );
}
