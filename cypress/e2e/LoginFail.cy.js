describe("Login Fail", () => {
  it("Log in", () => {
    cy.visit("http://localhost:5173/")

    cy.get(".Header-profileBtn").click()

    cy.get('[name="email"]').type("fout@gmail.com")
    cy.get('[name="REDACTED_PASSWORD"]').type("fout")

    cy.get('.AuthButton').should('be.visible').click()

    cy.get('.AuthFeedback').should('exist')

    cy.url().should('include', '/login')
  })
})
