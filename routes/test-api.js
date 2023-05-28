const fs = require("fs")
const path = require("path")
const mysql = require("mysql")

const dbConfig = {
    user: "root",
    host: "localhost",
    database: "nodelogin",
}

function executeQueries(connection, queries) {
    return new Promise((resolve, reject) => {
        connection.query(queries, (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

async function resetDatabase() {
    const connection = mysql.createConnection({
        ...dbConfig,
        multipleStatements: true, // Allow multiple statements per query
    })

    try {
        // Connect to the MySQL server
        connection.connect()
        // Drop the current database
        await executeQueries(
            connection,
            `DROP DATABASE IF EXISTS ${dbConfig.database};`
        )

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, "../Database.sql")
        const sqlFileContent = fs.readFileSync(sqlFilePath, "utf8")
        // Split the SQL file content into individual queries
        const queries = sqlFileContent
            .split(";")
            .map((query) => query.trim())
            .filter((query) => query.length > 0)
        // Execute each query individually
        for (const query of queries) {
            await executeQueries(connection, query)
        }
        console.log("Database reset successfully.")
    } catch (error) {
        console.error("Error resetting the database:", error)
    } finally {
        // Close the connection
        connection.end()
    }
}

module.exports = { resetDatabase, executeQueries }
