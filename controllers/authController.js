var randtoken = require("rand-token")
var nodemailer = require("nodemailer")

const { validationResult } = require("express-validator")
const encrypt = require("../lib/hashing")
const sendMail = require("../lib/sendEmail")

const dbConn = require("../config/db_Connection")

// Home Page
exports.homePage = (req, res, next) => {
    var query1
    if (req.method == "GET") {
        if (req.session.level == 1) query1 = "SELECT * FROM `courses`"
        else
            query1 =
                `SELECT * FROM courses as CO LEFT JOIN users as US ` +
                `ON CO.user_id = US.id WHERE US.id = "${req.session.userID}"`
    } else if (req.method == "POST") {
        const { body } = req
        //fulltext search
        if (req.session.level == 1) {
            query1 =
                `SELECT * FROM courses WHERE MATCH (code, title, description)` +
                ` AGAINST ("${body.search_Key}" IN NATURAL LANGUAGE MODE)`
        } else {
            query1 =
                `SELECT * FROM courses as CO LEFT JOIN users as US ON CO.user_id = US.id` +
                ` WHERE US.id = "${req.session.userID}"` +
                ` AND MATCH (code, title, description)` +
                ` AGAINST ("${body.search_Key}" IN NATURAL LANGUAGE MODE)`
        }

        //Alternative: search multiple columns with "concat & like" operators
        /*
         * `SELECT * FROM courses WHERE concat (code, title, description)` +
         *		` like "%${body.search_Key}%"`;
         */
    }
    dbConn.query(query1, async (error, result) => {
        if (error) {
            console.log(error)
            throw error
        }
        res.render("home", { data: result, title: "Homepage" })
    })
}

// Register Page
exports.registerPage = (req, res, next) => {
    res.render("auth/register")
}

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req)
    const { body } = req

    if (!errors.isEmpty()) {
        return res.render("auth/register", { error: errors.array()[0].msg })
    }

    try {
        var query2 = "SELECT * FROM `users` WHERE `email`=?"
        dbConn.query(query2, [body.email], async (error, row) => {
            if (error) {
                console.log(error)
                throw error
            }

            if (row.length >= 1) {
                return res.render("auth/register", {
                    error: "This email already in use.",
                })
            }

            //const hashPass = await bcrypt.hash(body._password, 12);
            const hashPass = await encrypt.encryptPassword(body.password)
            var query3 =
                "INSERT INTO `users`(`fname`,`lname`,`gender`,`email`,`password`) VALUES(?,?,?,?,?)"
            dbConn.query(
                query3,
                [body.fname, body.lname, body.gender, body.email, hashPass],
                (error, rows) => {
                    if (error) {
                        console.log(error)
                        throw error
                    }

                    if (rows.affectedRows !== 1) {
                        return res.render("auth/register", {
                            error: "Your registration has failed.",
                        })
                    }

                    // res.render("auth/register",
                    // 			{msg: 'You have successfully registered. You can Login now!'});
                    res.redirect("/auth/login")
                }
            )
        })
    } catch (e) {
        next(e)
    }
}

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("auth/login")
}

// Login User
exports.login = (req, res, next) => {
    const errors = validationResult(req)
    const { body } = req

    if (!errors.isEmpty()) {
        return res.render("auth/login", { error: errors.array()[0].msg })
    }

    try {
        var query4 = "SELECT * FROM `users` WHERE `email`=?"
        dbConn.query(query4, [body.email], async function (error, row) {
            if (error) throw error
            else {
                if (row.length != 1) {
                    return res.render("auth/login", {
                        error: "Invalid email address or password.",
                    })
                }

                //const checkPass = await bcrypt.compare(body.password, row[0].password);
                const checkPass = await encrypt.matchPassword(
                    body.password,
                    row[0].password
                )

                if (checkPass === true) {
                    req.session.userID = row[0].id
                    req.session.email = row[0].email
                    req.session.level = row[0].level
                    console.log(req.session)
                    return res.redirect("/homepage")
                }

                res.render("auth/login", {
                    error: "Invalid email address or password.",
                })
            }
        })
    } catch (e) {
        next(e)
    }
}

// Password reset link request Page
exports.forgotPassword = (req, res, next) => {
    res.render("auth/passReset_Request")
}

/* send reset password link in email */
exports.sendResetPassLink = (req, res, next) => {
    const { body } = req
    const email = body.email

    var query2 = 'SELECT * FROM users WHERE email ="' + email + '"'
    dbConn.query(query2, function (err, result) {
        if (err) throw err

        if (result.length > 0) {
            const token = randtoken.generate(20)
            const sent = sendMail.sendingMail(email, token)

            if (sent != "0") {
                var data = { token: token }
                var query3 = 'UPDATE users SET ? WHERE email ="' + email + '"'
                dbConn.query(query3, data, function (err, result) {
                    if (err) throw err
                })

                res.render("auth/passReset_Request", {
                    msg: "The reset password link has been sent to your email address",
                })
            } else {
                res.render("auth/passReset_Request", {
                    error: "Something goes to wrong. Please try again",
                })
            }
        } else {
            console.log("2")
            res.render("auth/passReset_Request", {
                error: "The Email is not registered with us",
            })
        }
    })
}

// Password reset Page
exports.resetPasswordPage = (req, res, next) => {
    res.render("auth/reset_password", { token: req.query.token })
}

/* update password to database */
exports.resetPassword = (req, res, next) => {
    const errors = validationResult(req)
    const { body } = req

    if (!errors.isEmpty()) {
        return res.render("auth/reset_password", {
            token: token,
            error: errors.array()[0].msg,
        })
    }

    var token = body.token
    var query5 = 'SELECT * FROM users WHERE token ="' + token + '"'
    dbConn.query(query5, async (err, result) => {
        if (err) throw err

        if (result.length > 0) {
            const hashPass = await encrypt.encryptPassword(body.password)
            var query5 =
                'UPDATE users SET password = ? WHERE email ="' +
                result[0].email +
                '"'
            dbConn.query(query5, hashPass, function (err, result) {
                if (err) throw err
            })

            res.render("auth/reset_password", {
                token: 0,
                msg: "Your password has been updated successfully",
            })
        } else {
            console.log("2")
            res.render("auth/reset_password", {
                token: token,
                error: "Invalid link; please try again",
            })
        }
    })
}
