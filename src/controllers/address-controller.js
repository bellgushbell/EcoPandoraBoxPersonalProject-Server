const prisma = require('../configs/prisma');

// ดึงที่อยู่ของผู้ใช้
exports.getAddress = async (req, res, next) => {
    try {
        const userId = req.query.userId || null; // รับ userId จาก query string
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const address = await prisma.addresses.findFirst({
            where: { userId: parseInt(userId) },
        });

        res.json(address || {}); // ถ้าไม่มีข้อมูล คืนค่า object ว่าง
    } catch (error) {
        next(error);
    }
};

// บันทึกหรืออัปเดตที่อยู่
exports.saveAddress = async (req, res, next) => {
    try {
        const { userId, fullName, addressLine, city, postalCode, phone } = req.body;

        if (!fullName || !addressLine || !city || !postalCode || !phone) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (userId) {
            // อัปเดตหรือสร้างที่อยู่สำหรับ User
            const existingAddress = await prisma.addresses.findFirst({ where: { userId } });
            if (existingAddress) {
                await prisma.addresses.update({
                    where: { id: existingAddress.id },
                    data: { fullName, addressLine, city, postalCode, phone },
                });
            } else {
                await prisma.addresses.create({
                    data: { userId, fullName, addressLine, city, postalCode, phone },
                });
            }
        } else {
            // Guest: บันทึกที่อยู่โดยไม่ผูกกับ User
            await prisma.addresses.create({
                data: { fullName, addressLine, city, postalCode, phone },
            });
        }

        res.json({ message: "Address saved successfully." });
    } catch (error) {
        next(error);
    }
};



exports.getAddressId = async (req, res, next) => {
    try {
        const userId = req.query.userId || null; // รับ userId จาก query string
        if (!userId) {
            // ตรวจสอบ guest address ใน req.body
            const { fullName, addressLine, city, postalCode, phone } = req.body;

            if (!fullName || !addressLine || !city || !postalCode || !phone) {
                return res.status(400).json({ message: 'Incomplete guest address data.' });
            }

            // สร้าง address สำหรับ guest
            const newAddress = await prisma.addresses.create({
                data: { fullName, addressLine, city, postalCode, phone, userId: null },
            });

            return res.json({ addressId: newAddress.id }); // ส่งกลับ addressId ใหม่
        }

        // สำหรับผู้ใช้ที่มี userId
        const address = await prisma.addresses.findFirst({
            where: { userId: parseInt(userId) },
            select: { id: true },
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        res.json({ addressId: address.id });
    } catch (error) {
        next(error);
    }
};
