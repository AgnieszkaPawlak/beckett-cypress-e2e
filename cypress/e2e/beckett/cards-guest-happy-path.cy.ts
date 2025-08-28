import { Card } from '../../support/types'

describe('Beckett - Happy Path (CARDS, guest)', () => {
    it('TC001: completes order until checkout', () => {
        cy.visitHomePage()
        cy.location('pathname').should('eq', '/');

        cy.startCardsOrderAsGuest()
        cy.location('pathname').should('include', '/submit/cards/service');

        cy.selectStandardSubgrades()
        cy.location('pathname').should('include', '/submit/cards/service/standard/subgrades/details');

        cy.fixture('cardTestValues').then((testData) => {
            const cards = testData.happyPath.cards
            cards.forEach((card: Card, cardIndex: number) => {
                // Row index starts from 1 not 0
                let rowIndex = cardIndex + 1

                cy.addManualCard({ setName: `Test Set ${rowIndex}` })
                cy.setCardDeclaredValueAndQuantity(rowIndex, card.quantity, card.declaredValue)

                if (card.oversized) {
                    cy.addTestContext(`Card marked as oversized, card with value: ` + card.declaredValue)
                    // Oversized index starts from 0...
                    cy.log('Marked card as oversized')
                    cy.markOversized(cardIndex)
                }

                cy.addTestContext(`Card added, card with value: ` + card.declaredValue)
            })
        })

        cy.screenshot('happy-path-cards-added')

        cy.assertOrderSummaryBasics(5)
        cy.proceedFromSummary()

        cy.fixture('userData').then((user) => cy.fillShippingForm(user))
        cy.selectShippingInternational()
        cy.getByTestIdOr(null, '#shipping-International').should('be.checked');
        cy.contains(/Return Shipping: International/i)
            .closest('tr')
            .find('td')
            .eq(1)
            .should('contain.text', '$64');

        cy.checkRequiredConsents()
        cy.getByTestIdOr(null,'#checked-tos').should('be.checked');
        cy.getByTestIdOr(null,'#checked-expiration').should('be.checked');

        cy.assertFeesIfVisible({oversizedUsd: 8, shippingUsd: 64})

        cy.clickCheckoutOrContinue()
        cy.screenshot('happy-path-checkout')
        cy.location('pathname', { timeout: 10000 }).should('include', '/payment');

    })
})
