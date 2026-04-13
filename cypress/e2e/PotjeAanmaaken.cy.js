describe("Potje aanmaken", () => {
  it("Potje aanmaken", () => {
    cy.visit("http://localhost:5173/");

    cy.get(".Header-profileBtn").click();

    cy.get('[name="email"]').type("bob@gmail.com");
    cy.get('[name="REDACTED_PASSWORD"]').type("bobbobbob");

    cy.get(".AuthButton").should("be.visible").click();

    cy.get(".Balance-hero > h1")
      .should("be.visible")
      .should("contain", "Saldo in je potjes");

    cy.get(".plus-icon").should("be.visible").click();

    cy.get(":nth-child(1) > .input").type("Test potje");
    cy.get(".prefixWrap > .input").type("100");
    cy.get('[aria-label="Kies icoon BusFront"]').click();
    cy.get(".btn").should("be.visible").click();

    cy.get(".budget-see-all").should("be.visible").click();

    cy.get(".SpendingOverview").within(() => {
      cy.get(":nth-child(1) > .transaction__info > .transaction__name").should(
        "exist",
      );
    });
  });
});
