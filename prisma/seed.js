require('dotenv').config();
const prisma = require("../src/configs/prisma"); // Import Prisma Client
const bcrypt = require("bcryptjs");

// เข้ารหัส Password
const hashedPassword = bcrypt.hashSync("123456", 10);

// Data ตัวอย่าง
const userData = [
    {
        email: "admin01@mail.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Bell",
        profileImage: "https://res.cloudinary.com/dvrgra6z8/image/upload/v1733282657/21733282653800_198.8429946562207.png",
        phone: "0123456789",
        gender: "MALE",
        role: "ADMIN",
    },
    {
        email: "user01@mail.com",
        password: hashedPassword,
        firstName: "User",
        lastName: "One",
        profileImage: "https://res.cloudinary.com/dvrgra6z8/image/upload/v1733282657/21733282653800_198.8429946562207.png",
        phone: "0123456789",
        gender: "MALE",
        role: "USER",
    },
    {
        email: "user02@mail.com",
        password: hashedPassword,
        firstName: "User",
        lastName: "Two",
        phone: "0123456789",
        gender: "FEMALE",
        role: "USER",
    },
];

const campaignsData = [
    {
        name: "Flood Relief Donation",
        description: "Help communities affected by flooding with essential supplies.",
        image: "https://images.pexels.com/photos/1739855/pexels-photo-1739855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        goalAmount: 50000.0,
        raisedAmount: 12000.0,
        isActive: true,
    },

    {
        name: "Save the Ocean",
        description: "Help us clean the ocean and save marine life.",
        image: "https://images.pexels.com/photos/2765872/pexels-photo-2765872.jpeg?auto=compress&cs=tinysrgb&w=800",
        goalAmount: 50000.0,
        raisedAmount: 2500.0,
        isActive: true,
    },
    {
        name: "Plant a Tree",
        description: "Plant more trees for a better environment.",
        image: "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        goalAmount: 30000.0,
        raisedAmount: 4500.0,
        isActive: true,
    },
    {
        name: "Reduce Food Waste",
        description: "Support programs that distribute surplus food to those in need.",
        image: "https://images.pexels.com/photos/2284166/pexels-photo-2284166.jpeg?auto=compress&cs=tinysrgb&w=800",
        goalAmount: 40000.0,
        raisedAmount: 5000.0,
        isActive: true,
    },

    {
        name: "Help Starving Children",
        description: "Provide food and nutrition to underprivileged children.",
        image: "https://live.staticflickr.com/7375/9687984332_cc7e555636_b.jpg",
        goalAmount: 60000.0,
        raisedAmount: 20000.0,
        isActive: true,
    },
    {
        name: "Earthquake Relief",
        description: "Support families affected by recent earthquakes with shelter and food.",
        image: "https://images.pexels.com/photos/14000726/pexels-photo-14000726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        goalAmount: 70000.0,
        raisedAmount: 18000.0,
        isActive: true,
    },


];


const randomItemsData = [
    // หลัก 10 บาท
    {
        name: "Eco Stickers",
        description: "Fun eco-themed stickers to remind everyone to reduce plastic usage.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA7vtByOs8aYkgBS73N7UFAOE3O5KwdAxOeg&s",
        priceRange: 10,
    },
    {
        name: "Reusable Straw",
        description: "A set of stainless steel reusable straws.",
        image: "https://m.media-amazon.com/images/I/71GOaETBvzL._AC_UF1000,1000_QL80_.jpg",
        priceRange: 10,
    },
    {
        name: "Seed Paper Bookmark",
        description: "A biodegradable bookmark that can be planted to grow flowers or herbs.",
        image: "https://www.growingpaper.co.za/wp-content/uploads/2023/02/Bookmarks_FGB010-1024x1024.jpg",
        priceRange: 10,
    },

    // หลัก 100 บาท
    {
        name: "Eco Bag",
        description: "A reusable eco-friendly bag.",
        image: "https://images.pexels.com/photos/1214212/pexels-photo-1214212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        priceRange: 100,
    },
    {
        name: "Mini Bamboo Utensils",
        description: "A compact bamboo spoon and fork set, perfect for eco-conscious living.",
        image: "https://mimiszerowastemarket.com/cdn/shop/products/minitools.jpg?v=1631955695",
        priceRange: 100,
    },
    {
        name: "Eco Notebook",
        description: "A notebook made from recycled paper.",
        image: "https://www.sagana-ideas.com/wp-content/uploads/2020/08/871.jpg",
        priceRange: 100,
    },
    {
        name: "Eco Tumbler",
        description: "A small tumbler for your daily drinks.",
        image: "https://www.eco-reusable.com/wp-content/uploads/2020/04/bio-based_tumbler_open.jpg",
        priceRange: 100,
    },




    // หลัก 1,000 บาท
    {
        name: "Stainless Steel Water Bottle",
        description: "A durable water bottle for reducing single-use plastic.",
        image: "https://img.lazcdn.com/g/p/341b0f813943aadde40af60c4c597358.jpg_360x360q75.jpg_.webp",
        priceRange: 1000,
    },
    {
        name: "Eco Lunch Box",
        description: "A lunch box made from sustainable materials.",
        image: "https://img.lazcdn.com/g/p/15c8b658e52b5add37ba0e3217f0b602.jpg_720x720q80.jpg",
        priceRange: 1000,
    },
    {
        name: "Solar LED Lamp",
        description: "A portable solar-powered LED lamp, perfect for outdoor activities or emergencies.",
        image: "https://www.thailandpostmart.com/files/product_thumb/20231005141155.png",
        priceRange: 1000,
    },
    {
        name: "Compost Bin",
        description: "A small compost bin for your kitchen.",
        image: "https://www.bhg.com/thmb/01Uui3dwnKQZoCU8kk_LEbwr-NA=/4000x0/filters:no_upscale():strip_icc()/BHG-gardening-yard-compost-diy-compost-bin-step-Hero-A-e6c108bdf3ea457aaf16435a04c0dcd2.jpg",
        priceRange: 1000,
    },
    {
        name: "Reusable Coffee Cup",
        description: "A reusable coffee cup made from recycled materials.",
        image: "https://media.product.which.co.uk/prod/images/original/gm-fd0c32d2-c290-457b-aa4a-bd39c2c095ba-all-cups-and-mugs-main.jpeg",
        priceRange: 1000,
    },
    {
        name: "Solar-Powered Power Bank",
        description: "A portable power bank powered by solar energy, perfect for eco-conscious travelers.",
        image: "https://down-th.img.susercontent.com/file/sg-11134201-22120-bce5oov17ukvce",
        priceRange: 1000,
    },

    // หลัก 10,000 บาท
    {
        name: "Home Solar Panel Kit",
        description: "A solar panel kit for home use.",
        image: "https://www.gogreensolar.com/cdn/shop/products/solar-kit-6kw_600x600.jpg?v=1571438584",
        priceRange: 10000,
    },
    {
        name: "Electric Bicycle",
        description: "An eco-friendly electric bicycle.",
        image: "https://hips.hearstapps.com/hmg-prod/images/cannondale-adventure-neo-ebike-034-66ccd3f6b8f43.jpg?crop=0.770xw:0.824xh;0.131xw,0.106xh&resize=980:*",
        priceRange: 10000,
    },
    {
        name: "Rainwater Harvesting System",
        description: "A system for harvesting and reusing rainwater.",
        image: "https://rainwatermanagement.com/cdn/shop/articles/Above-Ground-1600_2_2000x.jpg?v=1624460157",
        priceRange: 10000,
    },
    {
        name: "Energy-Efficient Air Conditioner",
        description: "An air conditioner with high energy efficiency.",
        image: "https://www.airconhyper.com/wp-content/uploads/2024/03/16.png",
        priceRange: 10000,
    },
    {
        name: "Compost Tumbler",
        description: "A large compost tumbler for outdoor use.",
        image: "https://www.bhg.com/thmb/aKdd8ynERkPsbMpJIBLpVBQdd8w=/2125x0/filters:no_upscale():strip_icc()/GettyImages-1355559503-745cb2444bda4df8b6f2611de10593cb.jpg",
        priceRange: 10000,
    },
];









// เพิ่มข้อมูลในฐานข้อมูล
async function run() {
    // เพิ่ม Users
    await prisma.user.createMany({ data: userData });
    console.log("Added users.");

    // เพิ่ม Campaigns
    await prisma.campaigns.createMany({ data: campaignsData });
    console.log("Added campaigns.");


    await prisma.randomItems.createMany({ data: randomItemsData });
    console.log("Added Random Items.");



    console.log("Seeding finished.");
}

run()
    .then(async () => {
        await prisma.$disconnect(); // ปิดการเชื่อมต่อฐานข้อมูลเมื่อเสร็จสิ้น
    })
    .catch(async (e) => {
        console.error("Error during seeding:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
