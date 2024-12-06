//import
const express = require("express");
const cors = require("cors");
const handleError = require("./src/middlewares/error");
const handleNotFound = require("./src/middlewares/notFound");

const campaignRoutes = require("./src/routes/campaign-route");
const authRoutes = require("./src/routes/auth-route");
const paymentRoutes = require("./src/routes/payment-route");
const randomItemsRoutes = require("./src/routes/randomItems-route");
const addressRoutes = require("./src/routes/address-route");
const shippingRoutes = require("./src/routes/shipping-route");
const chatController = require("./src/controllers/chat-controller");
const chatHistoryRoutes = require("./src/routes/chat-route");

//socket.io
const { Server } = require("socket.io");
const { createServer } = require("http"); // ใช้ HTTP Server

// config
require("dotenv").config();
const app = express();
const server = createServer(app); // ผูก Express กับ HTTP Server
const io = new Server(server, {
    cors: {
        origin: "*", // ตั้งค่าให้ Frontend เข้าถึงได้
        methods: ["GET", "POST"],
    },
});

// entry middlewares
app.use(cors());
app.use(express.json());

// API Path
app.use("/auth", authRoutes);
app.use("/campaign", campaignRoutes);
app.use("/payment", paymentRoutes);
app.use("/randomitems", randomItemsRoutes);
app.use("/address", addressRoutes);
app.use("/shipping", shippingRoutes);
app.use("/chathistory", chatHistoryRoutes);
// exit middlewares
app.use("*", handleNotFound);
app.use(handleError);

// Socket.IO Setup
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`); //ฟังทุกครั้งที่ผู้ใช้เชื่อมต่อ

    // Event สำหรับผู้ใช้
    socket.on("joinChat", () => chatController.userChat(io, socket)); //ฟังเฉพาะหน้าบ้าน socket.emit("joinChat"); แล้วจะทำ callback หลังบ้านคอนโทรลเลอร์ต่อ

    // Event สำหรับแอดมิน
    socket.on("adminJoin", () => chatController.adminChat(io, socket)); //ฟังเฉพาะแอดมิน

    // Event สำหรับผู้ใช้ตัดการเชื่อมต่อ
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`); // แจ้งในคอนโซลเมื่อผู้ใช้ตัดการเชื่อมต่อ
    });
});

// server listen
const port = process.env.PORT || 8111;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // เซิร์ฟเวอร์เริ่มต้นใช้งาน
});


// //import
// const express = require("express");
// const cors = require("cors");
// const handleError = require("./src/middlewares/error");
// const handleNotFound = require("./src/middlewares/notFound");

// const campaignRoutes = require("./src/routes/campaign-route");
// const authRoutes = require("./src/routes/auth-route");
// const paymentRoutes = require("./src/routes/payment-route");
// const randomItemsRoutes = require("./src/routes/randomItems-route");
// const addressRoutes = require("./src/routes/address-route");
// const shippingRoutes = require("./src/routes/shipping-route");
// const chatController = require("./src/controllers/chat-controller");

// //socket.io
// const { Server } = require("socket.io");
// const { createServer } = require("http"); // ใช้ HTTP Server

// // config
// require("dotenv").config();
// const app = express();
// const server = createServer(app); // ผูก Express กับ HTTP Server
// const io = new Server(server, {
//     cors: {
//         origin: "*", // ตั้งค่าให้ Frontend เข้าถึงได้
//         methods: ["GET", "POST"],
//     },
// });

// // entry middlewares
// app.use(cors());
// app.use(express.json());

// // API Path
// app.use("/auth", authRoutes);
// app.use("/campaign", campaignRoutes);
// app.use("/payment", paymentRoutes);
// app.use("/randomitems", randomItemsRoutes);
// app.use("/address", addressRoutes);
// app.use("/shipping", shippingRoutes);

// // exit middlewares
// app.use("*", handleNotFound);
// app.use(handleError);

// // Socket.IO Setup
// io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.id}`); //ฟังทุกครั้งที่ผู้ใช้เชื่อมต่อ

//     // Event สำหรับผู้ใช้
//     socket.on("joinChat", () => chatController.userChat(io, socket)); //ฟังเฉพาะหน้าบ้าน socket.emit("joinChat"); แล้วจะทำ callback หลังบ้านคอนโทรลเลอร์ต่อ

//     // Event สำหรับแอดมิน
//     socket.on("adminJoin", () => chatController.adminChat(io, socket)); //ฟังเฉพาะแอดมิน

//     // Event สำหรับผู้ใช้ตัดการเชื่อมต่อ
//     socket.on("disconnect", () => {
//         console.log(`User disconnected: ${socket.id}`); // แจ้งในคอนโซลเมื่อผู้ใช้ตัดการเชื่อมต่อ
//     });
// });

// // server listen
// const port = process.env.PORT || 8111;
// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`); // เซิร์ฟเวอร์เริ่มต้นใช้งาน
// });

