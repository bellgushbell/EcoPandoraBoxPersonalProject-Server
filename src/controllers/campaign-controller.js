const prisma = require("../configs/prisma")
const createError = require("../utility/createError")


exports.getAllCampaigns = async (req, res, next) => {
    try {
        const campaign = await prisma.campaigns.findMany({

        })
        res.json({ message: "get campaigns", campaign: campaign })

    } catch (error) {
        next(error)
    }


}