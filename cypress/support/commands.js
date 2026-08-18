import { ambienteBtp } from './ambiente'

// O login é um comando reutilizável porque será necessário em vários testes do BTP.
Cypress.Commands.add('loginNoBtp', () => {
  cy.env(['BTP_USERNAME', 'BTP_PASSWORD'], { log: false }).then(
    ({ BTP_USERNAME: username, BTP_PASSWORD: password }) => {
      expect(Boolean(username), 'BTP_USERNAME deve estar configurado').to.eq(true)
      expect(Boolean(password), 'BTP_PASSWORD deve estar configurado').to.eq(true)

      cy.visit(ambienteBtp.appUrl)

      cy.origin(
        ambienteBtp.iasOrigin,
        { args: { username, password } },
        ({ username, password }) => {
          cy.get('#j_username', { timeout: 30000 })
            .should('be.visible')
            .clear()
            .type(username, { log: false })

          cy.get('#j_password')
            .should('be.visible')
            .clear()
            .type(password, { log: false })

          cy.get('#logOnFormSubmit')
            .should('be.visible')
            .and('not.be.disabled')
            .click()
        }
      )

      cy.url({ timeout: 60000 }).should('include', ambienteBtp.launchpadHost)
    }
  )
})
