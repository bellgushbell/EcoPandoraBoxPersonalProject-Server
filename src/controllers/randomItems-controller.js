const prisma = require("../configs/prisma");

exports.RandomItems = async (req, res, next) => {
    try {
        const { totalPrice } = req.body;

        // ตรวจสอบความถูกต้องของ totalPrice
        if (!totalPrice || isNaN(totalPrice)) {
            return res.status(400).json({ message: "Invalid total price." });
        }

        // กำหนดช่วงของ priceRange ตาม totalPrice
        let priceRange;
        if (totalPrice >= 10 && totalPrice < 100) {
            priceRange = 10;
        } else if (totalPrice >= 100 && totalPrice < 1000) {
            priceRange = 100;
        } else if (totalPrice >= 1000 && totalPrice < 10000) {
            priceRange = 1000;
        } else if (totalPrice >= 10000) {
            priceRange = 10000;
        } else {
            return res.status(400).json({ message: "Invalid total price." });
        }

        console.log("priceRange", priceRange);

        // ดึงไอเท็มที่มี priceRange ตรงกับ totalPrice
        const items = await prisma.randomItems.findMany({
            where: {
                priceRange: priceRange,
            },
        });

        if (items.length === 0) {
            return res.status(404).json({ message: "No items found in this price range." });
        }

        // สุ่มเลือก 1 ไอเท็มจากรายการที่ตรงกับ priceRange
        const randomItem = items[Math.floor(Math.random() * items.length)];

        // บันทึกประวัติการได้รับไอเท็มลงในตาราง ReceivedRandomItems
        const receivedItem = await prisma.receivedRandomItems.create({
            data: {
                userId: req.userId || null,
                randomItemId: randomItem.id,
            },
        });

        res.json({
            randomItem,
            receivedItemId: receivedItem.id // ส่ง id กลับมา
        });
    } catch (error) {
        next(error);
    }
};
