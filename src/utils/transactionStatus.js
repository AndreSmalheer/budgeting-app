export function getTransactionStatusLabel(status) {
  if (status === "pending") {
    return "In behandeling";
  }

  if (status === "rejected") {
    return "Afgewezen";
  }

  return "Goedgekeurd";
}

export function getTransactionStatusTone(status) {
  if (status === "pending") {
    return "pending";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "approved";
}
