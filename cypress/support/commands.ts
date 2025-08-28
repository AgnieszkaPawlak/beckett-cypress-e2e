/// <reference types="cypress" />

import {CountryValue, GetByTestIdOrOptions, UserData} from "./types";

const findVisible = ($context: JQuery<HTMLElement>, selector: string) =>
    $context.find(selector).filter(':visible')

declare global {
    namespace Cypress {
        interface Chainable {

            addTestContext(message:string): Chainable

            getByTestIdOr(
                testId: string | null | undefined,
                fallbackSelector: string,
                options?: GetByTestIdOrOptions
            ): Chainable<JQuery<HTMLElement>>;

            clickVisible(selectors: string[]): Chainable

            visitHomePage(): Chainable

            acceptCookiesIfPresent(): Chainable

            startCardsOrderAsGuest(): Chainable

            selectStandardSubgrades(): Chainable

            addManualCard(opts: {
                sport?: string
                setName: string
                playerName?: string
            }): Chainable

            setCardDeclaredValueAndQuantity(
                rowIndex: number,
                qty: number,
                declaredValueUsd: number
            ): Chainable

            markOversized(rowIndex: number): Chainable

            assertOrderSummaryBasics(expectedItemsCount: number): Chainable

            proceedFromSummary(): Chainable

            fillShippingForm(user: UserData): Chainable

            selectShippingInternational(): Chainable

            checkRequiredConsents(): Chainable

            assertFeesIfVisible(opts: {
                oversizedUsd?: number
                shippingUsd?: number
            }): Chainable

            clickCheckoutOrContinue(): Chainable
        }
    }
}
export {}

Cypress.Commands.add('getByTestIdOr', (testId, fallbackSelector, options: GetByTestIdOrOptions = {}) => {
    const {
        ensureVisible = true,
        attrNames = ['data-testid', 'data-test-id'],
        ...rest
    } = options;

    const preferredSel = attrNames.map(a => `[${a}="${testId}"]`).join(',');

    Cypress.log({
        name: 'getByTestIdOr',
        message: `${testId} | ${fallbackSelector}`,
        consoleProps: () => ({ preferredSel, ensureVisible, rest })
    });

    return cy.get('body', { log: false }).then(($body) => {
        const usePreferred = $body.find(preferredSel).length > 0;
        const chain = usePreferred ? cy.get(preferredSel, rest) : cy.get(fallbackSelector, rest);
        return ensureVisible ? chain.should('be.visible') : chain;
    });
});

Cypress.Commands.add('clickVisible', (selectors) => {
    return cy.get('body', {timeout: Cypress.env("defaultCommandTimeout")}).then(($body) => {
        for (const selector of selectors) {
            const visibleElement = findVisible($body, selector)
            if (visibleElement.length) {
                return cy.get(selector).filter(':visible').first().click()
            }
        }
        throw new Error(
            `clickVisible: No visible selector found for the passed options: ${selectors.join(', ')}`
        )
    })
})

Cypress.Commands.add('visitHomePage', () => {
    cy.visit(Cypress.env('baseUrl') + '/')
})

Cypress.Commands.add('acceptCookiesIfPresent', () => {
    cy.get('body').then(() => {
        cy.getByTestIdOr(null, 'button').contains('Reject Optional Cookies')
            .then(($cookieBanner) => {
                if ($cookieBanner.length > 0) {
                    cy.log('Cookie banner found, rejecting...');
                    cy.getByTestIdOr(null, 'button').contains('Reject Optional Cookies')
                        .click({ force: true });
                    cy.getByTestIdOr(null, 'button')
                        .contains('Reject Optional Cookies')
                        .should('not.be.visible');
                    cy.getByTestIdOr(null, 'nav').should('be.visible');
                } else {
                    cy.log('Cookie banner not found, proceeding...');
                }
            });
    });
});

Cypress.Commands.add('startCardsOrderAsGuest', () => {
    cy.getByTestIdOr(null, 'a[href="/submit/cards/service"]')
        .first()
        .click()
    cy.contains('button, a', /continue as guest/i).should('be.visible')
    cy.acceptCookiesIfPresent()
    cy.contains('button, a', /continue as guest/i, {
        timeout: Cypress.env("defaultCommandTimeout"),
    }).click()
})



Cypress.Commands.add('selectStandardSubgrades', () => {
    cy.get('body').then(($body) => {
        if (

            $body.find('[data-testid="flip-front-card-1 a-standard-subgrades"]')
                .length > 0 ||
            $body.find(
                'a[href="/submit/cards/service/standard/subgrades/details"]'
            ).length > 0
        ) {
            cy.log('Found primary button for standard subgrades.')
            cy.getByTestIdOr(
                'flip-front-card-1 a-standard-subgrades',
                'a[href="/submit/cards/service/standard/subgrades/details"]'
            )
                .first()
                .click({force: true})
        } else {
            cy.log('Primary button not found. Attempting fallback...')
            cy.contains('a, button', /standard.*subgrades/i).click({
                force: true,
            })
        }
    });
});


Cypress.Commands.add('addManualCard', (opts) => {
    const {sport = 'Basketball', setName, playerName = 'Test Player'} = opts

    cy.contains("Can't find your card?", {timeout: Cypress.env("defaultCommandTimeout")})
        .should('be.visible')
        .click()

    cy.get('#sport_name', {timeout: Cypress.env("defaultCommandTimeout")}).select(sport)
    cy.get('#set_name').clear().type(setName)
    cy.get('#player_name').clear().type(playerName)
    cy.contains('button', /^Add Card$/i)
        .should('be.enabled')
        .click()
})

Cypress.Commands.add('setCardDeclaredValueAndQuantity', (rowIndex, qty, declaredValueUsd) => {
    cy.getByTestIdOr(`card-${rowIndex}`, '')
        .then(($card) => ($card.length ? cy.wrap($card) : cy.get('body')))
        .within(() => {
            cy.get(`#quantity${rowIndex}, [name="quantity${rowIndex}"]`, {
                timeout: Cypress.env("defaultCommandTimeout"),
            })
                .clear()
                .type(String(qty))
                .should('have.value', String(qty))
            cy.get(`#value${rowIndex}, [name="value${rowIndex}"]`, {
                timeout: Cypress.env("defaultCommandTimeout"),
            })
                .clear()
                .type(String(declaredValueUsd))
                .should('have.value', String(declaredValueUsd))
        })
})

Cypress.Commands.add('markOversized', (rowIndex) => {
    cy.clickVisible([
        `[data-test-id="${rowIndex}-oversized"]`,
        `#check-${rowIndex}-1`,
    ])
    cy.get(
        [
            `[data-test-id="${rowIndex}-oversized"]`,
            `#check-${rowIndex}-1`,
        ].join(', ')
    )
        .first()
        .should('be.checked')
})

Cypress.Commands.add('assertOrderSummaryBasics', (expectedItemsCount) => {
    cy.getByTestIdOr('order-summary', '', {timeout: 30000})
        .should('be.visible')
        .within(() => {
            cy.contains(/cards/i).should('exist');
            cy.contains(expectedItemsCount).should('exist');
        });
});


Cypress.Commands.add('proceedFromSummary', () => {
    cy.clickVisible([
        'button:contains("Continue")',
        '#summary-button',
    ])
})

Cypress.Commands.add('fillShippingForm', (user) => {
    cy.location('pathname').should(
        'match',
        /\/submit\/cards\/service\/standard\/subgrades\/shipping$/
    )

    const {
        firstName,
        lastName,
        email,
        phone,
        country,
        address,
        city,
        state,
        zipCode,
    } = user

    cy.get('#firstName').type(firstName).should('have.value', firstName)
    cy.get('#lastName').type(lastName).should('have.value', lastName)
    cy.get('#email').type(email).should('have.value', email)
    cy.get('#phone').clear().type(phone).should('have.value', phone)
    cy.get('#country').select(country)
    cy.get('#country')
        .invoke('val')
        .should((val) => {
            if ( typeof val === 'string') {
                const parsed: CountryValue = JSON.parse(val);
                expect(parsed.name).to.eq(country);
            }
        });
    cy.get('#line1').type(address).should('have.value', address)
    cy.get('#city').type(city).should('have.value', city)
    cy.get('#state').select(state).should('have.value', state)
    cy.get('#zipcode').type(zipCode).should('have.value', zipCode)
})

Cypress.Commands.add('selectShippingInternational', () => {
    cy.get('#shipping-International').check({
        force: true,
    })
    cy.contains(
        /customers are responsible for paying any applicable duties and taxes/i
    ).should('be.visible')
})

Cypress.Commands.add('checkRequiredConsents', () => {
    cy.get('#summary-button').click()
    cy.get('#checked-tos')
        .check()
        .should('be.checked')
    cy.get('#checked-expiration')
        .check()
        .should('be.checked')
})

Cypress.Commands.add('assertFeesIfVisible', (opts) => {
    cy.getByTestIdOr('order-summary', '#summary-button').then(($summary) => {
        if ($summary.length) {
            cy.wrap($summary).within(() => {
                if (opts.oversizedUsd !== undefined) {
                    cy.contains(/oversized/i)
                        .parent()
                        .should('contain.text', String(opts.oversizedUsd));
                }
                if (opts.shippingUsd !== undefined) {
                    cy.contains(/international/i)
                        .parent()
                        .should('contain.text', String(opts.shippingUsd))
                }
            });
        } else {
            throw new Error('Order summary not found on the page');
        }
    });
});


Cypress.Commands.add('clickCheckoutOrContinue', () => {
    cy.clickVisible(['button:contains("Checkout")', 'button:contains("Continue")']);
});
