const prisma = require("../configs/prisma");
const jwt = require("jsonwebtoken");
const createError = require("../utility/createError");

module.exports.userChat = async (io, socket) => {
    try {
        const token = socket.handshake.headers.authorization?.split(" ")[1];
        let user = null;

        // ตรวจสอบ Token และดึงข้อมูลผู้ใช้
        if (token) {
            try {
                const payload = jwt.verify(token, process.env.SECRET_KEY);
                user = await prisma.user.findUnique({ where: { id: payload.id } });
                if (!user) {
                    throw createError(401, "Unauthorized: Invalid token");
                }
            } catch (err) {
                console.error("Invalid token:", err.message);
                throw createError(401, "Unauthorized: Invalid token");
            }
        }

        // ค้นหาหรือสร้าง Chatbox สำหรับผู้ใช้หรือ Guest
        const chatRoom = await prisma.chatbox.upsert({
            where: user ? { userId: user.id } : { socketId: socket.id },
            update: { socketId: socket.id },
            create: user
                ? { userId: user.id, socketId: socket.id }
                : { socketId: socket.id },
        });

        // เข้าร่วมห้องแชท
        socket.join(chatRoom.id);

        // Event รับข้อความใหม่และบันทึกลงฐานข้อมูล
        socket.on("message", async (message) => {
            const newMessage = await prisma.message.create({
                data: {
                    chatboxId: chatRoom.id,
                    message,
                    isAdmin: !!user?.role && user.role === "ADMIN",
                },
            });

            // ส่งข้อความใหม่ให้ผู้ใช้ในห้อง
            io.to(chatRoom.id).emit("message", { data: newMessage });

            // แจ้งแอดมินว่ามีข้อความใหม่หากผู้ส่งไม่ใช่แอดมิน
            if (!newMessage.isAdmin) {
                io.to("admin").emit("userMessage", { data: newMessage });
            }
        });

        // Event อัปเดตข้อความเป็น "อ่านแล้ว" เมื่อผู้ใช้เปิดห้องแชท
        socket.on("read", async () => {
            try {
                const updatedMessages = await prisma.message.updateMany({
                    where: {
                        chatboxId: chatRoom.id,
                        isRead: false,
                    },
                    data: {
                        isRead: true,
                        readAt: new Date(),
                    },
                });

                // แจ้งผู้ใช้ในห้องว่าอ่านข้อความแล้ว
                io.to(chatRoom.id).emit("messageRead", {
                    chatboxId: chatRoom.id,
                    updatedMessages,
                });
            } catch (err) {
                console.error("Error marking messages as read:", err.message);
            }
        });

        // Event อัปเดต `isRead` เมื่อแอดมินเข้าห้องแชท
        socket.on("adminJoinChat", async (chatId) => {
            try {
                const adminChatRoom = await prisma.chatbox.findUnique({
                    where: { id: chatId },
                    include: { messages: true, user: true },
                });

                if (adminChatRoom) {
                    // อัปเดตข้อความในฐานข้อมูลว่าอ่านแล้ว
                    await prisma.message.updateMany({
                        where: {
                            chatboxId: adminChatRoom.id,
                            isRead: false,
                        },
                        data: {
                            isRead: true,
                            readAt: new Date(),
                        },
                    });

                    // แจ้งผู้ใช้ในห้องว่าแอดมินอ่านข้อความแล้ว
                    io.to(adminChatRoom.id).emit("messageRead", {
                        chatBoxId: adminChatRoom.id,
                    });

                    // แอดมินเข้าร่วมห้อง
                    socket.join(adminChatRoom.id);

                    // ส่งข้อมูลห้องแชทกลับไปให้แอดมิน
                    socket.emit("joinComplete", { room: adminChatRoom });
                }
            } catch (err) {
                console.error("Error in adminJoinChat:", err.message);
            }
        });

        // Event จัดการเมื่อผู้ใช้หรือ Guest ออกจากห้องแชท
        socket.on("disconnect", async () => {
            try {
                if (!user) {
                    // ลบ Chatbox ของ Guest ออกจากฐานข้อมูล
                    await prisma.chatbox.delete({ where: { id: chatRoom.id } });
                }
                // แจ้งแอดมินว่าผู้ใช้หรือ Guest ออกจากห้อง
                io.to("admin").emit("userLeave", { id: chatRoom.id });
            } catch (err) {
                console.error("Error deleting chatbox:", err.message);
            }
        });
    } catch (err) {
        console.error("Error in userChat:", err.message);
        socket.emit("error", { message: err.message });
    }
};

module.exports.adminChat = async (io, socket) => {
    try {
        const token = socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
            throw createError(401, "Unauthorized: No token provided");
        }

        const payload = jwt.verify(token, process.env.SECRET_KEY);
        const admin = await prisma.user.findUnique({ where: { id: payload.id } });

        if (!admin || admin.role !== "ADMIN") {
            throw createError(403, "Forbidden: Only admins can access");
        }

        socket.join("admin");

        const allChats = await prisma.chatbox.findMany({
            include: {
                messages: { orderBy: { createdAt: "desc" }, take: 1 },
                user: { select: { email: true, profileImage: true } },
            },
        });

        socket.emit("adminJoinComplete", allChats);

        // กำหนด `currentChatRoomId` ให้กับ Socket
        let currentChatRoomId = null;

        // เมื่อแอดมินเลือกเข้าห้องแชท
        socket.on("adminJoinChat", async (chatId) => {
            currentChatRoomId = chatId;

            const chatRoom = await prisma.chatbox.findUnique({
                where: { id: chatId },
                include: { messages: true, user: true },
            });

            if (chatRoom) {
                await prisma.message.updateMany({
                    where: { chatboxId: chatRoom.id, isRead: false },
                    data: { isRead: true, readAt: new Date() },
                });

                io.to(chatRoom.id).emit("messagesRead", { chatBoxId: chatRoom.id });

                socket.join(chatRoom.id);
                socket.emit("joinComplete", { room: chatRoom });
            }
        });

        // รับข้อความใหม่
        socket.on("message", async (message) => {
            if (!currentChatRoomId) return; // ตรวจสอบว่ามีการเลือกห้องแชทแล้ว

            const newMessage = await prisma.message.create({
                data: {
                    chatboxId: currentChatRoomId,
                    message,
                    isAdmin: true,
                },
            });

            io.to(currentChatRoomId).emit("message", { data: newMessage });
        });

        socket.on("disconnect", () => {
            console.log("Admin disconnected");
        });
    } catch (err) {
        console.error("Error in adminChat:", err.message);
        socket.emit("error", { message: err.message });
    }
};







// const prisma = require("../configs/prisma");
// const jwt = require("jsonwebtoken");
// const createError = require("../utility/createError");

// module.exports.userChat = async (io, socket) => {
//     try {
//         const token = socket.handshake.headers.authorization?.split(" ")[1];
//         let user = null;

//         // ตรวจสอบ Token และดึงข้อมูลผู้ใช้
//         if (token) {
//             try {
//                 const payload = jwt.verify(token, process.env.SECRET_KEY);
//                 user = await prisma.user.findUnique({ where: { id: payload.id } });
//                 if (!user) {
//                     throw createError(401, "Unauthorized: Invalid token");
//                 }
//             } catch (err) {
//                 console.error("Invalid token:", err.message);
//                 throw createError(401, "Unauthorized: Invalid token");
//             }
//         }

//         // ค้นหาหรือสร้าง Chatbox สำหรับผู้ใช้หรือ Guest
//         const chatRoom = await prisma.chatbox.upsert({
//             where: user ? { userId: user.id } : { socketId: socket.id },
//             update: { socketId: socket.id },
//             create: user
//                 ? { userId: user.id, socketId: socket.id }
//                 : { socketId: socket.id },
//         });

//         // เข้าร่วมห้องแชท
//         socket.join(chatRoom.id);

//         // Event รับข้อความใหม่และบันทึกลงฐานข้อมูล
//         socket.on("message", async (message) => {
//             const newMessage = await prisma.message.create({
//                 data: {
//                     chatboxId: chatRoom.id,
//                     message,
//                     isAdmin: !!user?.role && user.role === "ADMIN",
//                 },
//             });

//             // ส่งข้อความใหม่ให้ผู้ใช้ในห้อง
//             io.to(chatRoom.id).emit("message", { data: newMessage });

//             // แจ้งแอดมินว่ามีข้อความใหม่หากผู้ส่งไม่ใช่แอดมิน
//             if (!newMessage.isAdmin) {
//                 io.to("admin").emit("userMessage", { data: newMessage });
//             }
//         });

//         // Event อัปเดตข้อความเป็น "อ่านแล้ว" เมื่อผู้ใช้เปิดห้องแชท
//         socket.on("read", async () => {
//             try {
//                 const updatedMessages = await prisma.message.updateMany({
//                     where: {
//                         chatboxId: chatRoom.id,
//                         isRead: false,
//                     },
//                     data: {
//                         isRead: true,
//                         readAt: new Date(),
//                     },
//                 });

//                 // แจ้งผู้ใช้ในห้องว่าอ่านข้อความแล้ว
//                 io.to(chatRoom.id).emit("messageRead", {
//                     chatboxId: chatRoom.id,
//                     updatedMessages,
//                 });
//             } catch (err) {
//                 console.error("Error marking messages as read:", err.message);
//             }
//         });

//         // Event อัปเดต `isRead` เมื่อแอดมินเข้าห้องแชท
//         socket.on("adminJoinChat", async (chatId) => {
//             try {
//                 const adminChatRoom = await prisma.chatbox.findUnique({
//                     where: { id: chatId },
//                     include: { messages: true, user: true },
//                 });

//                 if (adminChatRoom) {
//                     // อัปเดตข้อความในฐานข้อมูลว่าอ่านแล้ว
//                     await prisma.message.updateMany({
//                         where: {
//                             chatboxId: adminChatRoom.id,
//                             isRead: false,
//                         },
//                         data: {
//                             isRead: true,
//                             readAt: new Date(),
//                         },
//                     });

//                     // แจ้งผู้ใช้ในห้องว่าแอดมินอ่านข้อความแล้ว
//                     io.to(adminChatRoom.id).emit("messageRead", {
//                         chatBoxId: adminChatRoom.id,
//                     });

//                     // แอดมินเข้าร่วมห้อง
//                     socket.join(adminChatRoom.id);

//                     // ส่งข้อมูลห้องแชทกลับไปให้แอดมิน
//                     socket.emit("joinComplete", { room: adminChatRoom });
//                 }
//             } catch (err) {
//                 console.error("Error in adminJoinChat:", err.message);
//             }
//         });

//         // Event จัดการเมื่อผู้ใช้หรือ Guest ออกจากห้องแชท
//         socket.on("disconnect", async () => {
//             try {
//                 if (!user) {
//                     // ลบ Chatbox ของ Guest ออกจากฐานข้อมูล
//                     await prisma.chatbox.delete({ where: { id: chatRoom.id } });
//                 }
//                 // แจ้งแอดมินว่าผู้ใช้หรือ Guest ออกจากห้อง
//                 io.to("admin").emit("userLeave", { id: chatRoom.id });
//             } catch (err) {
//                 console.error("Error deleting chatbox:", err.message);
//             }
//         });
//     } catch (err) {
//         console.error("Error in userChat:", err.message);
//         socket.emit("error", { message: err.message });
//     }
// };

// module.exports.adminChat = async (io, socket) => {
//     try {
//         const token = socket.handshake.headers.authorization?.split(" ")[1];

//         if (!token) {
//             throw createError(401, "Unauthorized: No token provided");
//         }

//         const payload = jwt.verify(token, process.env.SECRET_KEY);
//         const admin = await prisma.user.findUnique({ where: { id: payload.id } });

//         if (!admin || admin.role !== "ADMIN") {
//             throw createError(403, "Forbidden: Only admins can access");
//         }

//         socket.join("admin");

//         const allChats = await prisma.chatbox.findMany({
//             include: {
//                 messages: { orderBy: { createdAt: "desc" }, take: 1 },
//                 user: { select: { email: true, profileImage: true } },
//             },
//         });

//         socket.emit("adminJoinComplete", allChats);

//         // กำหนด `currentChatRoomId` ให้กับ Socket
//         let currentChatRoomId = null;

//         // เมื่อแอดมินเลือกเข้าห้องแชท
//         socket.on("adminJoinChat", async (chatId) => {
//             currentChatRoomId = chatId;

//             const chatRoom = await prisma.chatbox.findUnique({
//                 where: { id: chatId },
//                 include: { messages: true, user: true },
//             });

//             if (chatRoom) {
//                 await prisma.message.updateMany({
//                     where: { chatboxId: chatRoom.id, isRead: false },
//                     data: { isRead: true, readAt: new Date() },
//                 });

//                 io.to(chatRoom.id).emit("messagesRead", { chatBoxId: chatRoom.id });

//                 socket.join(chatRoom.id);
//                 socket.emit("joinComplete", { room: chatRoom });
//             }
//         });

//         // รับข้อความใหม่
//         socket.on("message", async (message) => {
//             if (!currentChatRoomId) return; // ตรวจสอบว่ามีการเลือกห้องแชทแล้ว

//             const newMessage = await prisma.message.create({
//                 data: {
//                     chatboxId: currentChatRoomId,
//                     message,
//                     isAdmin: true,
//                 },
//             });

//             io.to(currentChatRoomId).emit("message", { data: newMessage });
//         });

//         socket.on("disconnect", () => {
//             console.log("Admin disconnected");
//         });
//     } catch (err) {
//         console.error("Error in adminChat:", err.message);
//         socket.emit("error", { message: err.message });
//     }
// };







