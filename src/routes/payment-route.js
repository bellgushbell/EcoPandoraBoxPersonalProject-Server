const express = require("express")
const router = express.Router();
const paymentController = require("../controllers/payment-controller")


router.post("/create-payment-intent", paymentController.payment)
router.post("/success", paymentController.paymentSuccess)

module.exports = router