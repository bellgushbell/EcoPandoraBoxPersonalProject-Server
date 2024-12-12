const prisma = require("../configs/prisma");
const cloudinary = require('cloudinary').v2; // หากใช้ Cloudinary สำหรับอัปโหลดรูปภาพ
const fs = require('fs');
const path = require('path');

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



//admin
exports.getAllRandomItems = async (req, res, next) => {
    try {
        const randomItems = await prisma.randomItems.findMany({
            orderBy: {
                createdAt: 'desc', // เรียงลำดับตามวันที่สร้าง
            },
        });
        res.status(200).json(randomItems);
    } catch (error) {
        console.error('Error in getAllRandomItems:', error);
        next(error);
    }
};


exports.AddRandomItem = async (req, res, next) => {
    try {
        const { name, description, priceRange } = req.body;

        if (!['10', '100', '1000', '10000'].includes(priceRange)) {
            return res.status(400).json({ message: 'Invalid price range.' });
        }

        const haveFile = !!req.file;
        let uploadResult = {};

        if (haveFile) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                overwrite: true,
                public_id: path.parse(req.file.path).name,
            });
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete local file:', err);
            });
        }

        const randomItem = await prisma.randomItems.create({
            data: {
                name,
                description,
                image: uploadResult.secure_url || '',
                priceRange: parseInt(priceRange, 10),
            },
        });

        res.status(200).json({ message: 'Random Item created successfully', randomItem });
    } catch (error) {
        console.error('Error adding random item:', error);
        next(error);
    }
};



//admin edit
exports.EditRandomItem = async (req, res, next) => {
    try {
        const { id, name, description, priceRange } = req.body;
        let image = req.body.image;

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'auto',
                overwrite: true,
            });
            image = uploadResult.secure_url;
        }

        const updatedItem = await prisma.randomItems.update({
            where: { id: +id },
            data: { name, description, priceRange: +priceRange, image },
        });

        res.status(200).json({ message: 'Edit Item successfully', updatedItem });
    } catch (error) {
        console.error('Error in EditRandomItem:', error);
        next(error);
    }
};

exports.DelRandomItem = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.randomItems.delete({
            where: { id: +id },
        });

        res.status(200).json({ message: 'Delete Item successfully' });
    } catch (error) {
        console.error('Error in DelRandomItem:', error);
        next(error);
    }
};