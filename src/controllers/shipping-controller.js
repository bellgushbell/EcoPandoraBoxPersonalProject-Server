const prisma = require('../configs/prisma');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a new shipping record
exports.createShipping = async (req, res, next) => {
    try {
        const { userId, addressId, receivedItemId, address, email } = req.body; // เพิ่ม email
        let finalAddressId = addressId;

        console.log(email)

        // ถ้าไม่มี addressId และเป็น Guest ให้สร้างที่อยู่ใหม่
        if (!finalAddressId && !userId) {
            const newAddress = await prisma.addresses.create({
                data: {
                    fullName: address.fullName,
                    addressLine: address.addressLine,
                    city: address.city,
                    postalCode: address.postalCode,
                    phone: address.phone,
                },
            });
            finalAddressId = newAddress.id;
        }

        const newShipping = await prisma.shipping.create({
            data: {
                userId: userId || null,
                addressId: finalAddressId,
                receivedItemId,
                status: 'PENDING',
            },
            include: {
                address: true,
                receivedItem: {
                    include: {
                        randomItem: true,
                    },
                },
            },
        });

        // ส่งอีเมลยืนยัน
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.PASS_EMAIL,
            },
        });

        const mailOptions = {
            from: process.env.GMAIL,
            to: email, // ใช้ email จาก body
            subject: 'Shipping Confirmation',
            html: `
<body style="margin: 0; padding: 0; background-color: #e9f7ef; font-family: 'Arial', sans-serif; width: 100%;" >
    <table align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
        <tr>
            <td style="padding: 30px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 20px; background: linear-gradient(90deg, #43cea2, #185a9d); border-radius: 10px 10px 0 0; color: white;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Shipping Confirmation</h1>
                            <p style="margin: 0; font-size: 16px; font-weight: lighter;">Your shipping details have been successfully created.</p>
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 10px;">
                            <img src="https://www.lappymaker.com/images/greentick-unscreen.gif" alt="Confirmation GIF"
                                style="width: 100%; max-width: 300px; border-radius: 8px; display: block;" />
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #444; font-size: 16px; text-align: center; line-height: 1.6;">
                                Thank you for choosing us. Below are your shipping details:
                            </p>
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px; background-color: #f0f9f5; border-radius: 8px; border: 1px solid #d4edda;">
                            <h2 style="color: #43cea2; font-size: 18px; margin: 0;">Shipping Details</h2>
                            <p style="margin: 10px 0; color: #333; font-size: 14px;"><strong>Shipping ID:</strong> ${newShipping.id}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Item:</strong> ${newShipping.receivedItem?.randomItem?.name || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Recipient:</strong> ${newShipping.address?.fullName}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Address:</strong> ${newShipping.address?.addressLine}, ${newShipping.address?.city}, ${newShipping.address?.postalCode}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Status:</strong> ${newShipping.status}</p>
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0;"></td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px; text-align: center; border-top: 1px solid #d4edda; background-color: #f0f9f5;">
                            <p style="margin: 0; color: #777; font-size: 14px; line-height: 1.6;">
                                If you have any questions or require further assistance, feel free to contact us at
                                <a href="mailto:${process.env.GMAIL}" style="color: #43cea2; text-decoration: none; font-weight: bold;">${process.env.GMAIL}</a>.
                            </p>
                            <p style="margin: 10px 0 0; color: #999; font-size: 12px;">© 2024 Your Company Name. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'Shipping created successfully.', shipping: newShipping });
    } catch (error) {
        console.error('Error in createShipping:', error);
        next(error);
    }
};


// Update shipping status
exports.updateShippingStatus = async (req, res, next) => {
    try {
        const { shippingId, status } = req.body;

        const updatedShipping = await prisma.shipping.update({
            where: { id: shippingId },
            data: { status },
        });

        res.json({ message: 'Shipping status updated successfully.', shipping: updatedShipping });
    } catch (error) {
        next(error);
    }
};

// Get shipping details by user or guest
exports.getShippingDetails = async (req, res, next) => {
    try {
        const { userId, guest } = req.query;

        const whereCondition = userId
            ? { userId: parseInt(userId) } // ดึงข้อมูลของ User
            : guest === 'true'
                ? { userId: null } // ดึงข้อมูลเฉพาะ Guest
                : {}; // ไม่กรองอะไรเลย (ดึงข้อมูลทั้งหมด)

        const shippingDetails = await prisma.shipping.findMany({
            where: whereCondition,
            include: {
                address: true,
                receivedItem: {
                    include: {
                        randomItem: true,
                    },
                },
            },
        });

        res.json(shippingDetails);
    } catch (error) {
        next(error);
    }
};

