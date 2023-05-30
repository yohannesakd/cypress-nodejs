// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("loginByForm", (email, password) => {
    Cypress.log({
        name: "loginByForm",
        message: `${email} | ${password}`,
    })

    return cy.request({
        method: "POST",
        url: "http://localhost:5000/auth/login",
        form: true,
        body: {
            email,
            password,
        },
    })
})

Cypress.Commands.add("test_cleanup", () => {
    cy.task("resetDB")
    Cypress.log({
        name: "resetDB",
        message: "completed",
    })
})

Cypress.Commands.add("getUserId", () => {
    return cy.request("http://localhost:5000/get-user-id").then((res) => {
        return res.body.userID
    })
    // return cy.request("http://localhost:5000/get-user-id").then((response) => {
    //     return response.body.userID
    // })
})

Cypress.Commands.add("addRecord", (request) => {
    return cy.request({
        method: "POST",
        url: "http://localhost:5000/pages/add",
        form: true,
        body: request,
        followRedirect: false,
    })
})
