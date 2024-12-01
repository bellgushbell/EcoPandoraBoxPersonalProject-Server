//import
const express = require("express")
const cors = require("cors")
const handleError = require("./src/middlewares/error")
const handleNotFound = require("./src/middlewares/notFound")

// config
require("dotenv").config();
const app = express()



// entry middlewares
app.use(cors())
app.use(express.json())

// API Path


// exit middlewares
app.use("*", handleNotFound)
app.use(handleError)
// server listen
const port = process.env.PORT || 8111
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

