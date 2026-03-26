import { useState } from "react";
import { useParams } from "react-router-dom"


function BudgetDetails() {
  const { id } = useParams()

  return <div>Showing budget: {id}</div>
}

export default BudgetDetails
