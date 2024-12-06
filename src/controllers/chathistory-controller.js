const prisma = require("../configs/prisma");
const jwt = require("jsonwebtoken");

module.exports.getChatBoxID = async (req, res, next) => {
    try {
        const socketId = req.query.socketId; // รับ socketId จาก query
        const token = req.headers.authorization?.split(" ")[1]; // แยก token
        let userId = null;

        // Decode token เพื่อดึง userId ถ้ามี token
        if (token) {
            const decoded = jwt.decode(token);
            userId = decoded?.id;
        }

        // ตรวจสอบว่า socketId หรือ userId ต้องมีค่าอย่างใดอย่างหนึ่ง
        if (!socketId && !userId) {
            return res.status(400).json({ message: "Missing socketId or token" });
        }

        // ค้นหา ChatBox โดยใช้ userId (สำหรับ User) หรือ socketId (สำหรับ Guest)
        let chatBox = await prisma.chatbox.findFirst({
            where: userId
                ? { userId } // ถ้าเป็น User ใช้ userId
                : { socketId }, // ถ้าเป็น Guest ใช้ socketId
            select: { id: true },
        });

        // ถ้ายังไม่มี ChatBox ให้สร้างใหม่
        if (!chatBox) {
            chatBox = await prisma.chatbox.create({
                data: userId
                    ? { userId } // สร้างใหม่สำหรับ User
                    : { socketId }, // สร้างใหม่สำหรับ Guest
            });
        }

        res.json({ chatBoxId: chatBox.id }); // ส่ง chatBoxId กลับไป
    } catch (error) {
        console.error("Error in getChatBoxID:", error.message);
        next(error);
    }
};

module.exports.getChatHistory = async (req, res, next) => {
    try {
        const chatBoxId = parseInt(req.params.chatBoxId, 10);

        if (isNaN(chatBoxId)) {
            return res.status(400).json({ message: "Invalid chatBoxId" });
        }

        const chatHistory = await prisma.message.findMany({
            where: { chatboxId: chatBoxId },
            orderBy: { createdAt: "asc" }, // เรียงตามเวลา
        });

        res.json(chatHistory);
    } catch (error) {
        console.error("Error fetching chat history:", error.message);
        next(error);
    }
};



// const prisma = require("../configs/prisma");
// const jwt = require("jsonwebtoken");

// module.exports.getChatBoxID = async (req, res, next) => {
//     try {
//         const socketId = req.query.socketId; // รับ socketId จาก query
//         const token = req.headers.authorization?.split(" ")[1]; // แยก token
//         let userId = null;

//         // Decode token เพื่อดึง userId ถ้ามี token
//         if (token) {
//             const decoded = jwt.decode(token);
//             userId = decoded?.id;
//         }

//         // ตรวจสอบว่า socketId หรือ userId ต้องมีค่าอย่างใดอย่างหนึ่ง
//         if (!socketId && !userId) {
//             return res.status(400).json({ message: "Missing socketId or token" });
//         }

//         // ค้นหา ChatBox โดยใช้ userId (สำหรับ User) หรือ socketId (สำหรับ Guest)
//         let chatBox = await prisma.chatbox.findFirst({
//             where: userId
//                 ? { userId } // ถ้าเป็น User ใช้ userId
//                 : { socketId }, // ถ้าเป็น Guest ใช้ socketId
//             select: { id: true },
//         });

//         // ถ้ายังไม่มี ChatBox ให้สร้างใหม่
//         if (!chatBox) {
//             chatBox = await prisma.chatbox.create({
//                 data: userId
//                     ? { userId } // สร้างใหม่สำหรับ User
//                     : { socketId }, // สร้างใหม่สำหรับ Guest
//             });
//         }

//         res.json({ chatBoxId: chatBox.id }); // ส่ง chatBoxId กลับไป
//     } catch (error) {
//         console.error("Error in getChatBoxID:", error.message);
//         next(error);
//     }
// };

// module.exports.getChatHistory = async (req, res, next) => {
//     try {
//         const chatBoxId = parseInt(req.params.chatBoxId, 10);

//         if (isNaN(chatBoxId)) {
//             return res.status(400).json({ message: "Invalid chatBoxId" });
//         }

//         const chatHistory = await prisma.message.findMany({
//             where: { chatboxId: chatBoxId },
//             orderBy: { createdAt: "asc" }, // เรียงตามเวลา
//         });

//         res.json(chatHistory);
//     } catch (error) {
//         console.error("Error fetching chat history:", error.message);
//         next(error);
//     }
// };



