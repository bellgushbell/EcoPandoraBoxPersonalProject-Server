const express = require("express")
const router = express.Router();
const campaignController = require("../controllers/campaign-controller")


router.get("/getlist", campaignController.getAllCampaigns)

module.exports = router