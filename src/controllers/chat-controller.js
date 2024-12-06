const prisma = require("../configs/prisma");
const jwt = require("jsonwebtoken");
const createError = require("../utility/createError");

module.exports.userChat = async (io, socket) => {
    try {
        const token = socket.handshake.headers.authorization?.split(" ")[1];
        let user = null;

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

        const chatRoom = await prisma.chatbox.upsert({
            where: user ? { userId: user.id } : { socketId: socket.id },
            update: { socketId: socket.id },
            create: user
                ? { userId: user.id, socketId: socket.id }
                : { socketId: socket.id },
        });

        socket.join(chatRoom.id);

        socket.on("message", async (message) => {
            const newMessage = await prisma.message.create({
                data: {
                    chatboxId: chatRoom.id,
                    message,
                    isAdmin: !!user?.role && user.role === "ADMIN",
                },
            });

            io.to(chatRoom.id).emit("message", { data: newMessage });

            if (!newMessage.isAdmin) {
                io.to("admin").emit("userMessage", { data: newMessage });
            }
        });

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

                io.to(chatRoom.id).emit("messageRead", {
                    chatboxId: chatRoom.id,
                    updatedMessages,
                });
            } catch (err) {
                console.error("Error marking messages as read:", err.message);
            }
        });

        socket.on("disconnect", async () => {
            try {
                if (!user) {
                    await prisma.chatbox.delete({ where: { id: chatRoom.id } });
                }
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

        socket.on("adminJoinChat", async (chatId) => {
            const chatRoom = await prisma.chatbox.findUnique({
                where: { id: chatId },
                include: { messages: true, user: true },
            });

            if (chatRoom) {
                socket.join(chatRoom.id);
                socket.emit("joinComplete", { room: chatRoom });

                socket.on("message", async (message) => {
                    console.log("Message received:", message)
                    const newMessage = await prisma.message.create({
                        data: {
                            chatboxId: chatRoom.id,
                            message: message, // message เป็น String
                            isAdmin: true,
                        },
                    });

                    io.to(chatRoom.id).emit("message", { data: newMessage });

                    if (!newMessage.isAdmin) {
                        io.to("admin").emit("userMessage", { data: newMessage });
                    }
                });

                socket.on("read", async () => {
                    await prisma.message.updateMany({
                        where: { chatboxId: chatRoom.id, isRead: false },
                        data: { isRead: true },
                    });
                });
            }
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

//         const chatRoom = await prisma.chatbox.upsert({
//             where: user ? { userId: user.id } : { socketId: socket.id },
//             update: { socketId: socket.id },
//             create: user
//                 ? { userId: user.id, socketId: socket.id }
//                 : { socketId: socket.id },
//         });

//         socket.join(chatRoom.id);

//         socket.on("message", async (message) => {
//             const newMessage = await prisma.message.create({
//                 data: {
//                     chatboxId: chatRoom.id,
//                     message,
//                     isAdmin: !!user?.role && user.role === "ADMIN",
//                 },
//             });

//             io.to(chatRoom.id).emit("message", { data: newMessage });

//             if (!newMessage.isAdmin) {
//                 io.to("admin").emit("userMessage", { data: newMessage });
//             }
//         });

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

//                 io.to(chatRoom.id).emit("messageRead", {
//                     chatboxId: chatRoom.id,
//                     updatedMessages,
//                 });
//             } catch (err) {
//                 console.error("Error marking messages as read:", err.message);
//             }
//         });

//         socket.on("disconnect", async () => {
//             try {
//                 if (!user) {
//                     await prisma.chatbox.delete({ where: { id: chatRoom.id } });
//                 }
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

//         socket.on("adminJoinChat", async (chatId) => {
//             const chatRoom = await prisma.chatbox.findUnique({
//                 where: { id: chatId },
//                 include: { messages: true, user: true },
//             });

//             if (chatRoom) {
//                 socket.join(chatRoom.id);
//                 socket.emit("joinComplete", { room: chatRoom });

//                 socket.on("message", async (message) => {
//                     console.log("Message received:", message)
//                     const newMessage = await prisma.message.create({
//                         data: {
//                             chatboxId: chatRoom.id,
//                             message: message, // message เป็น String
//                             isAdmin: true,
//                         },
//                     });

//                     io.to(chatRoom.id).emit("message", { data: newMessage });

//                     if (!newMessage.isAdmin) {
//                         io.to("admin").emit("userMessage", { data: newMessage });
//                     }
//                 });

//                 socket.on("read", async () => {
//                     await prisma.message.updateMany({
//                         where: { chatboxId: chatRoom.id, isRead: false },
//                         data: { isRead: true },
//                     });
//                 });
//             }
//         });

//         socket.on("disconnect", () => {
//             console.log("Admin disconnected");
//         });
//     } catch (err) {
//         console.error("Error in adminChat:", err.message);
//         socket.emit("error", { message: err.message });
//     }
// };





