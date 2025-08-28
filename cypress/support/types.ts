export type UserData = {
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    address: string
    city: string
    state: string
    zipCode: string
}

export type Card = {
    oversized: boolean
    quantity: number
    declaredValue: number
}

export type GetByTestIdOrOptions =
    Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow> & {
    preferTimeout?: number;
    ensureVisible?: boolean;
    attrNames?: string[];
};

export interface CountryValue {
    code: string;
    name: string;
}
