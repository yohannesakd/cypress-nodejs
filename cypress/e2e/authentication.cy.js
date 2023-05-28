describe("Logging In", function () {
    // we can use these values to log in
    const email = "yoniassefayoni@gmail.com"
    const password = "Yohannes123"

    context("Unauthorized attempt", function () {
        it("is redirected on visit to /homepage when no session", function () {
            // we must have a valid session cookie to be logged
            // in else we are redirected to /unauthorized
            cy.visit("http://localhost:5000/homepage")
            cy.url().should("include", "/auth/login")
        })

        it("is redirected using cy.request", function () {
            // instead of visiting the page above we can test this by issuing
            // a cy.request, checking the status code and redirectedToUrl property.

            // the 'redirectedToUrl' property is a special Cypress property under the hood
            // that normalizes the url the browser would normally follow during a redirect
            cy.request({
                url: "http://localhost:5000/homepage",
                followRedirect: false, // turn off following redirects automatically
            }).then((resp) => {
                // should have status code 302
                expect(resp.status).to.eq(302)

                // when we turn off following redirects Cypress will also send us
                // a 'redirectedToUrl' property with the fully qualified URL that we
                // were redirected to.
                expect(resp.redirectedToUrl).to.eq(
                    "http://localhost:5000/auth/login"
                )
            })
        })
    })

    context("Login form submission", function () {
        beforeEach(function () {
            cy.visit("http://localhost:5000/auth/login")
        })

        it("displays errors on login", function () {
            // incorrect email on purpose
            cy.get("input[name=email]").type("jane@lae.com", { delay: 0 })
            cy.get("input[name=password]").type("password123{enter}", {
                delay: 0,
            })

            // we should have visible errors now
            cy.get(".err-msg").should(
                "contain",
                "Invalid email address or password"
            )

            // and still be on the same URL
            cy.url().should("include", "/login")
        })

        it("redirects to /homepage on success", function () {
            cy.get("input[name=email]").type(email)
            cy.get("input[name=password]").type(password)
            cy.get("form").submit()

            // we should be redirected to /dashboard
            cy.url().should("include", "/homepage")
            // and our cookie should be set to 'cypress-session-cookie'
            cy.getCookie("session").should("exist")
        })
    })

    context("Login form submission with cy.request", function () {
        it("can bypass the UI and yet still test log in", function () {
            cy.request({
                method: "POST",
                url: "http://localhost:5000/auth/login", // baseUrl will be prepended to this url
                form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
                body: {
                    email,
                    password,
                },
            })

            // just to prove we have a session
            cy.getCookie("session").should("exist")
        })
    })

    context('Reusable "login" custom command', function () {
        // command defined in /support/commands.js
        beforeEach(function () {
            // login before each test
            cy.loginByForm(email, password)
        })

        it("can visit /homepage", function () {
            // after cy.request, the session cookie has been set
            // and we can visit a protected page
            cy.visit("http://localhost:5000/homepage")
            cy.title().should("contain", "Homepage")
        })

        it("can visit authenticated pages - display page", function () {
            // or another protected page
            cy.visit("http://localhost:5000/pages/display")
            cy.get("h2").should("contain", "CRUD RESTful API")
        })
    })
})
describe("Registration", function () {
    before(() => {
        cy.test_cleanup()
    })
    const registerFormInputAndExpectedErrors = {
        empty: ["", "First Name required"],
        fname: ["Yohannes", "Last Name required"],
        lname: ["Assefa", "Email Address required"],
        email: ["assefayohannes5@gmail.com", "Gender is required"],
        gender: ["Male", "Password is required"],
        password: ["Password123", "Passwords do not match"],
        cpassword: ["Password123", "Success"],
    }
    beforeEach(() => {
        cy.visit("localhost:5000/auth/signup")
    })
    context("Form Validations", () => {
        Object.entries(registerFormInputAndExpectedErrors).forEach(
            (item, index) => {
                it(`tests ${item[0]} input validation`, () => {
                    if (item[0] === "empty") {
                        cy.get("input[type='submit']").click()
                        cy.get(".err-msg").contains("First Name required")
                    } else {
                        for (let i = 1; i <= index; i++) {
                            if (
                                Object.keys(registerFormInputAndExpectedErrors)[
                                    i
                                ] == "gender"
                            ) {
                                cy.get('input[type="radio"]').first().check()
                                continue
                            }
                            cy.get(
                                `input[name="${
                                    Object.keys(
                                        registerFormInputAndExpectedErrors
                                    )[i]
                                }"]`
                            ).type(
                                Object.values(
                                    registerFormInputAndExpectedErrors
                                )[i][0],
                                { delay: 0 }
                            )
                        }
                    }
                    cy.get("input[type='submit']").click()
                    if (item[0] == "cpassword") {
                        cy.url().should("contain", "/login")
                    } else {
                        cy.get(".err-msg").contains(item[1][1])
                    }
                })
            }
        )
        it("checks existing user registration", () => {
            cy.get('input[name="fname"]').type("Yohannes", { delay: 0 })
            cy.get('input[name="lname"]').type("Assefa", { delay: 0 })
            cy.get('input[name="email"]').type("yoniassefayoni@gmail.com", {
                delay: 0,
            })
            cy.get('input[type="radio"]').first().check()
            cy.get("input[name=password]").type("Yohannes123", { delay: 0 })
            cy.get("input[name=cpassword]").type("Yohannes123", { delay: 0 })
            cy.get("input[type='submit']").click()

            cy.get(".err-msg").contains("This email already in use.")
        })
    })
    context("Signup form submission with cy.request", function () {
        it("can bypass the UI and yet still test sign up", function () {
            console.log(
                ...Object.values(registerFormInputAndExpectedErrors)
                    .slice(1)
                    .map((item) => item[0])
            )
            cy.request({
                method: "POST",
                url: "http://localhost:5000/auth/signup", // baseUrl will be prepended to this url
                form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
                body: {
                    ...Object.values(registerFormInputAndExpectedErrors)
                        .slice(1)
                        .map((item) => item[0]),
                },
            })

            // just to prove we have a session
        })
        it("new sign up can login", () => {
            cy.loginByForm("assefayohannes5@gmail.com", "Password123")
            cy.visit("http://localhost:5000/homepage")
            cy.title().should("contain", "Homepage")
        })
    })
})
