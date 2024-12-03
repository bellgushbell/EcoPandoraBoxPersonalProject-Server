const prisma = require("../configs/prisma")
const createError = require("../utility/createError")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res, next) => {
    try {
        const { totalPrice } = req.body;
        // console.log(stripe)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(totalPrice) * 100,
            // amount: 1000,
            currency: "thb",
            payment_method_types: ["card", "promptpay"],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        next(error)
    }


}
exports.paymentSuccess = async (req, res, next) => {
    try {
        const { totalPrice, userId, campaignId, paymentIntentId } = req.body;

        console.log("Request Body paymentSuccess:", req.body);

        // ตรวจสอบว่าผู้ใช้และแคมเปญมีอยู่ในระบบ
        const campaign = await prisma.campaigns.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw createError(404, "Campaign not found");
        }

        // ตรวจสอบสถานะการชำระเงินจาก Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            throw createError(400, "Payment not successful");
        }

        // บันทึกข้อมูลการบริจาค
        const donation = await prisma.donations.create({
            data: {
                userId: userId || null, // กำหนด userId เป็น null หากเป็นguest
                campaignId,
                amount: Number(totalPrice),
                paymentStatus: "COMPLETED",
            },
        });

        // อัปเดตยอดเงินที่รวบรวมในแคมเปญ
        await prisma.campaigns.update({
            where: { id: campaignId },
            data: {
                raisedAmount: {
                    increment: Number(totalPrice),
                },
            },
        });

        res.json({
            message: "Payment Success",
            donation,
        });
    } catch (error) {
        console.error("Error in paymentSuccess:", error);
        next(error);
    }
};
