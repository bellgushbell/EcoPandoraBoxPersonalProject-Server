const express = require("express")
const router = express.Router();
const randomItemsController = require("../controllers/randomItems-controller")


router.post("/getitem", randomItemsController.RandomItems)

module.exports = router