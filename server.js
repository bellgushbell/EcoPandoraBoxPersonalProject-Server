//import
const express = require("express")
const cors = require("cors")
const handleError = require("./src/middlewares/error")
const handleNotFound = require("./src/middlewares/notFound")
const campaignRoutes = require("./src/routes/campaign-route")
const authRoutes = require("./src/routes/auth-route")
const paymentRoutes = require("./src/routes/payment-route")
const randomItemsRoutes = require("./src/routes/randomItems-route")
const addressRoutes = require("./src/routes/address-route")

// config
require("dotenv").config();
const app = express()



// entry middlewares
app.use(cors())
app.use(express.json())

// API Path
app.use("/auth", authRoutes)
app.use("/campaign", campaignRoutes)
app.use("/payment", paymentRoutes)
app.use("/randomitems", randomItemsRoutes)
app.use("/address", addressRoutes)
// exit middlewares
app.use("*", handleNotFound)
app.use(handleError)
// server listen
const port = process.env.PORT || 8111
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

