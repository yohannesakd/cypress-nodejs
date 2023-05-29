describe("Add Items", () => {
    const email = "yoniassefayoni@gmail.com"
    const password = "Yohannes123"

    const courseFormInputAndExpectedErrors = {
        course_title: {
            input: ["", "1234", "Software Quality Assurance and Testing"],
            errors: [
                "Course title is required",
                "Course title: Only Characters with white space are allowed",
                "Course code is required",
            ],
        },
        course_code: {
            input: ["SQ1", "SQ+1", "SQAT01"],
            errors: [
                "Course code must be a minimum of 4 alphanumeric length",
                "Course code must be alphanumeric",
                "Course description is required",
            ],
        },
        course_desc: {
            input: ["Quality assurance and Testing in Software Development"],
            errors: ["Course category is required"],
        },
        course_cat: {
            input: ["01", "Software Management"],
            errors: [
                "Course Category: Only Characters with white space are allowed",
                "Certificate type is required",
            ],
        },
        certificate: {
            input: ["01", "Professional Certificate"],
            errors: [
                "Certificate type: Only Characters with white space are allowed",
                "Course duration is required",
            ],
        },
        course_dur: {
            input: ["abcd", "3"],
            errors: [
                "Course duration: Only numbers are allowed",
                "Course cost is required",
            ],
        },
        course_cost: {
            input: ["abcd", "550"],
            errors: ["Course cost: Only numeric values are allowed", "Success"],
        },
    }

    context("Input Validation", () => {
        beforeEach(() => {
            cy.loginByForm(email, password)
            cy.visit("http://localhost:5000/pages/add")
            cy.get("h3").should("contain", "Add New Record")
        })

        before(() => {
            cy.test_cleanup()
        })

        Object.entries(courseFormInputAndExpectedErrors).forEach(
            (item, index) => {
                it(`Tests ${item[0]} Validation`, () => {
                    item[1].input.forEach((text, idx) => {
                        if (index > 0) {
                            for (let i = 0; i < index; i++) {
                                console.log(
                                    Object.keys(
                                        courseFormInputAndExpectedErrors
                                    )[i]
                                )
                                console.log(
                                    Object.values(
                                        courseFormInputAndExpectedErrors
                                    )[i].input.at(-1)
                                )
                                cy.get(
                                    `[name="${
                                        Object.keys(
                                            courseFormInputAndExpectedErrors
                                        )[i]
                                    }"]`
                                ).type(
                                    Object.values(
                                        courseFormInputAndExpectedErrors
                                    )[i].input.at(-1),
                                    { delay: 0 }
                                )
                            }
                        }
                        if (text) {
                            cy.get(`[name="${item[0]}"]`).type(text)
                        }
                        cy.get("[type=submit]").click()

                        if (item[1].errors[idx] == "Success") {
                            cy.get(".success-msg").should(
                                "contain",
                                "Record successfully added!"
                            )
                        } else
                            [
                                cy
                                    .get(".err-msg")
                                    .should("contain", item[1].errors[idx]),
                            ]
                    })
                })
            }
        )
    })
})
