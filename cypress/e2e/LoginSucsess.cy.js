describe("Login Sucsess", () => {
  it("Log in", () => {
    cy.visit("http://localhost:5173/")

    cy.get(".Header-profileBtn").click()

    cy.get('[name="email"]').type("bob@gmail.com")
    cy.get('[name="REDACTED_PASSWORD"]').type("bobbobbob")

    cy.get('.AuthButton').should('be.visible').click()

    cy.get('.Balance-hero > h1').should('be.visible').should('contain', 'Saldo in je potjes')
  })
})
