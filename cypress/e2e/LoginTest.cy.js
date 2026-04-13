describe("My First Test", () => {
  it("Visits a website and checks content", () => {
    cy.visit("http://localhost:5173");

    cy.get(".Header-profileBtn").click();

    cy.get('[name="email"]').type("bob@gmail.com");
    cy.get('[name="REDACTED_PASSWORD"]').type("bobbobbob");

    cy.get('.AuthButton').click();

    cy.url().should('eq', 'http://localhost:3000/dashboard')
  });
});
