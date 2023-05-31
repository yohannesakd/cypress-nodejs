const { defineConfig } = require("cypress")

let dumpFile = "dump.sql"
let mysql = require("mysql")
let exec = require("child_process").exec

// Where would the file be located?
const { resetDatabase } = require("./routes/test-api")
// Database connection settings.

module.exports = defineConfig({
  projectId: 'whi1kk',
    // experimentalInteractiveRunEvents: true,
    e2e: {
        setupNodeEvents(on, config) {
            on("task", {
                async resetDB() {
                    await resetDatabase()
                    return null
                },
            })
        },
    },
})
