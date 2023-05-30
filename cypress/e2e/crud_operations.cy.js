const email = "yoniassefayoni@gmail.com"
const password = "Yohannes123"

//Object containing the input field names and the values to be input as well as the expected errors from each input in arrays
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
//extracting keys and values from the object to clean up the code
let validCourseFormInput = {}
const courseFormInputNames = Object.keys(courseFormInputAndExpectedErrors)
const courseFormInputValues = Object.values(courseFormInputAndExpectedErrors)
let values = courseFormInputValues.map((item) => {
    return item.input.at(-1)
})
let keys = courseFormInputNames
keys.forEach((key, index) => {
    validCourseFormInput[key] = values[index]
})

describe("Add Records", () => {
    context("Input Validation and form submission", () => {
        // Code to be run before the execution of each "it" block
        beforeEach(() => {
            cy.loginByForm(email, password)
            cy.visit("http://localhost:5000/pages/add")
            cy.get("h3").should("contain", "Add New Record")
        })
        // code to be run before the execution of the next context/it block
        before(() => {
            //Check /support/commands.js
            //custom command added to reset database to base state when called
            cy.test_cleanup()
        })

        //the forms are validated upon submission, to validate one input we must input all the valid inputs in the fields before it so that we can see the errors for it, this loop does that
        Object.entries(courseFormInputAndExpectedErrors).forEach(
            (item, index) => {
                //each test item named based on what field is being tested
                it(`Tests ${item[0]} Validation`, () => {
                    item[1].input.forEach((text, idx) => {
                        if (index > 0) {
                            //loop through all the previous inputs from the one we are testing now and insert the valid inputs into those, which are the last elements of the arrays. (array.at(-1))
                            for (let i = 0; i < index; i++) {
                                cy.get(
                                    `[name="${courseFormInputNames[i]}"]`
                                ).type(courseFormInputValues[i].input.at(-1), {
                                    delay: 0,
                                })
                                //delay = 0 removes the typing delay
                            }
                        }
                        //The reason text is being checked for is because the first input value at the beginning of the test is an empty string and cypress doesnt allow typing empty strings, making this conditional necessary
                        if (text) {
                            cy.get(`[name="${item[0]}"]`).type(text)
                        }
                        cy.get("[type=submit]").click()
                        //checking if the last input to be tested is reached so we can check for success message instead of error message
                        if (item[1].errors[idx] == "Success") {
                            cy.get(".success-msg").should(
                                "contain",
                                "Record successfully added!"
                            )
                        }
                        // checking for error message when its not the last input
                        else
                            [
                                cy
                                    .get(".err-msg")
                                    .should("contain", item[1].errors[idx]),
                            ]
                    })
                })
            }
        )
        it("Checks existing record adding", () => {
            //selecting all the last indices of the input array in the object (which are the valid inputs) to type into the fields and submit
            let inputs = courseFormInputValues.map((item) => {
                return item.input.at(-1)
            })

            courseFormInputNames.forEach((input, index) => {
                cy.get(`[name=${input}]`).type(inputs[index])
            })
            cy.get("[type=submit]").click()
            cy.get(".err-msg").should(
                "contain",
                "Error: Course code already exists"
            )
        })
    })

    context("Form submission with cy.request", () => {
        beforeEach(() => {
            cy.loginByForm(email, password)
        })
        //Sending a post request directly to the server's add route to add a recorod
        it("can bypass the UI and add a record", () => {
            cy.request({
                method: "POST",
                url: "http://localhost:5000/pages/add",
                form: true,
                body: validCourseFormInput,
                followRedirect: false,
            }).then((response) => {
                expect(response.status).to.eq(200)
            })
            cy.visit("http://localhost:5000/pages/display")
            //looking through the table to find the newly inserted course code
            cy.get("td:first-child").should((rows) => {
                //callback function to perform any actions on items selected by cy.get which 'yields' the queried objects, much like JS getElementByTagName which yields a dom node
                let items = Object.values(rows)
                    .slice(0, rows.length)
                    .map((item) => item.textContent)
                expect(items).to.contain(
                    courseFormInputAndExpectedErrors.course_code.input.at(-1)
                )
            })
        })

        // let items = Object.values(rows)
        //             .slice(0, rows.length)
        //             .map((item) => item.textContent)
        //         expect(items).to.contain(
        //             courseFormInputAndExpectedErrors.course_code.input.at(-1)
        //         )
        //this block of code, first grabs only the values from the key:value pair of an object and places them in a single array. the slice method removes the last element(object size) which is unnecessary to our operation, since we are working with DOM objects, we are mapping the array to return only the textContent attribute. then we look through the array containing only text to match the course code

        // Testing the custom cypress command added to /support/commands.js for adding courses easily
        it("Custom cypress command for adding record", () => {
            cy.addRecord(validCourseFormInput)
            cy.visit("http://localhost:5000/pages/display")
            cy.get("td:first-child").should((rows) => {
                let items = Object.values(rows)
                    .slice(0, rows.length)
                    .map((item) => item.textContent)
                expect(items).to.contain(
                    courseFormInputAndExpectedErrors.course_code.input.at(-1)
                )
            })
        })
    })
})

describe("Read Records", () => {
    beforeEach(() => {
        cy.loginByForm(email, password)
        cy.visit("http://localhost:5000/pages/display")
    })
    before(() => {
        cy.test_cleanup()
    })

    context("Viewing Records", () => {
        it("can visit display page", () => {
            cy.title().should("contain", "Display Records")
        })
        it("can show newly added record", () => {
            cy.addRecord(validCourseFormInput)
            cy.visit("http://localhost:5000/pages/display")
        })
    })
    context("Searching records", () => {
        //checking empty input for search
        it("Handles empty search", () => {
            cy.get('input[type="submit"]').click()
            cy.get(".success-msg").should(
                "contain",
                "Please provide a search key!"
            )
        })
        it("can search records by code", () => {
            cy.get("input#search-Key").type(validCourseFormInput.course_code)
            cy.get('input[type="submit"]').click()
            cy.get("td:first-child").should((rows) => {
                let items = Object.values(rows)
                    .slice(0, rows.length)
                    .map((item) => item.textContent)
                expect(items).to.contain(validCourseFormInput.course_code)
            })
        })
    })
})

describe("Delete Records", () => {
    beforeEach(() => {
        cy.loginByForm(email, password)
        cy.addRecord(validCourseFormInput)
        cy.visit("http://localhost:5000/pages/display")
    })
    before(() => {
        cy.test_cleanup()
    })

    it("can delete records", () => {
        //Find button and click
        cy.get(`a[href="./delete/${validCourseFormInput.course_code}"]`).click()
        //Reload page
        cy.visit("http://localhost:5000/pages/display")
        //Check if entry exists
        cy.get(`a[href="./delete/${validCourseFormInput.course_code}"]`).should(
            "not.exist"
        )
    })
    it("can delete records with cy.request", () => {
        cy.visit(
            "http://localhost:5000/pages/delete/" +
                validCourseFormInput.course_code
        )
        cy.visit("http://localhost:5000/pages/display")

        cy.get(`a[href="./delete/${validCourseFormInput.course_code}"]`).should(
            "not.exist"
        )
    })
})

describe("Edit records", () => {
    beforeEach(() => {
        cy.loginByForm(email, password)
        cy.addRecord(validCourseFormInput)
        cy.visit(
            "http://localhost:5000/pages/edit/" +
                validCourseFormInput.course_code
        )
    })
    before(() => {
        cy.test_cleanup()
    })
    context("Edit form validations", () => {
        //similar execution to the add record validation
        Object.entries(courseFormInputAndExpectedErrors).forEach(
            (item, index) => {
                it.only(`Tests ${item[0]} Validation`, () => {
                    item[1].input.forEach((text, idx) => {
                        if (index < courseFormInputNames.length - 1) {
                            cy.get(
                                `[name=${
                                    Object.keys(
                                        courseFormInputAndExpectedErrors
                                    )[index]
                                }]`
                            ).clear({ delay: 0 })
                            cy.get(
                                `[name=${
                                    Object.keys(
                                        courseFormInputAndExpectedErrors
                                    )[index + 1]
                                }]`
                            ).clear({ delay: 0 })
                        } else {
                            cy.get(
                                `[name=${
                                    Object.keys(
                                        courseFormInputAndExpectedErrors
                                    )[index]
                                }]`
                            ).clear({ delay: 0 })
                        }
                        if (text) {
                            cy.get(`[name="${item[0]}"]`).type(text)
                        } else {
                            cy.get(`[name="${item[0]}"]`)
                        }
                        cy.get("[type=submit]").click()
                        if (item[1].errors[idx] == "Success") {
                            cy.title().should("contain", "Display Records")
                            cy.get(".success-msg").should("be.visible")
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
    context("Editing course data", () => {
        let newCourseCode = "SQA1"
        it("checks if data is changed successfully", () => {
            cy.get(`input[name=${Object.keys(validCourseFormInput)[1]}]`)
                .clear()
                .type(newCourseCode)
            cy.get("[type=submit]").click()

            cy.get("td:first-child").should((rows) => {
                let items = Object.values(rows)
                    .slice(0, rows.length)
                    .map((item) => item.textContent)
                expect(items).to.contain(newCourseCode)
            })
        })
    })
})

describe("Add Images", () => {
    beforeEach(() => {
        cy.loginByForm(email, password)
        cy.addRecord(validCourseFormInput)
        cy.visit(
            "http://localhost:5000/pages/addImage/" +
                validCourseFormInput.course_code
        )
    })
    before(() => {
        cy.test_cleanup()
    })
    it("Requires image to be selected", () => {
        cy.get("[type=submit]").click()
        cy.get(".err-msg").should(
            "contain",
            "Error: You must select an image. Only image files [JPG | JPEG | PNG] are allowed!"
        )
    })
    it("can upload image", () => {
        const fileName = "logo.png"
        cy.get('input[type="file"]').attachFile(fileName)
        cy.get("[type=submit]").click()
        cy.get(".success-msg").should(
            "contain",
            "Image is uploaded. Go back to Home page & check it."
        )
    })
    it("Verify if image is uploaded", () => {
        cy.visit("http://localhost:5000/homepage")
        cy.get("img").each((img) => {
            const src = img.attr("src")
            if (src.includes(validCourseFormInput.course_code)) {
                expect(src).to.include(validCourseFormInput.course_code)
            }
        })
    })
})
