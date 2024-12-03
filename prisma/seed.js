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
        phone: "0123456789",
        gender: "MALE",
        role: "ADMIN",
    },
    {
        email: "user01@mail.com",
        password: hashedPassword,
        firstName: "User",
        lastName: "One",
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
        image: "https://tinyurl.com/9784bwra",
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
        image: "https://images.pexels.com/photos/2853276/pexels-photo-2853276.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10,
    },
    {
        name: "Straw Sleeve",
        description: "A portable fabric sleeve for carrying stainless steel straws.",
        image: "https://images.pexels.com/photos/4964106/pexels-photo-4964106.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10,
    },
    {
        name: "Seed Paper Bookmark",
        description: "A biodegradable bookmark that can be planted to grow flowers or herbs.",
        image: "https://images.pexels.com/photos/276500/pexels-photo-276500.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10,
    },

    // หลัก 100 บาท
    {
        name: "Eco Bag",
        description: "A reusable eco-friendly bag.",
        image: "https://images.pexels.com/photos/5632401/pexels-photo-5632401.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },
    {
        name: "Reusable Straw",
        description: "A set of stainless steel reusable straws.",
        image: "https://images.pexels.com/photos/5732586/pexels-photo-5732586.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },
    {
        name: "Eco Notebook",
        description: "A notebook made from recycled paper.",
        image: "https://images.pexels.com/photos/4414852/pexels-photo-4414852.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },
    {
        name: "Eco Tumbler",
        description: "A small tumbler for your daily drinks.",
        image: "https://images.pexels.com/photos/4085293/pexels-photo-4085293.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },
    {
        name: "Plantable Pencil",
        description: "A pencil that can grow into a plant.",
        image: "https://images.pexels.com/photos/347891/pexels-photo-347891.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },
    {
        name: "Canvas Tote Bag",
        description: "A lightweight and reusable tote bag.",
        image: "https://images.pexels.com/photos/3738112/pexels-photo-3738112.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 100,
    },

    // หลัก 1,000 บาท
    {
        name: "Stainless Steel Water Bottle",
        description: "A durable water bottle for reducing single-use plastic.",
        image: "https://images.pexels.com/photos/3765139/pexels-photo-3765139.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },
    {
        name: "Eco Lunch Box",
        description: "A lunch box made from sustainable materials.",
        image: "https://images.pexels.com/photos/4569396/pexels-photo-4569396.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },
    {
        name: "Bamboo Cutlery Set",
        description: "A portable set of bamboo utensils.",
        image: "https://images.pexels.com/photos/4117464/pexels-photo-4117464.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },
    {
        name: "Compost Bin",
        description: "A small compost bin for your kitchen.",
        image: "https://images.pexels.com/photos/6161924/pexels-photo-6161924.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },
    {
        name: "Reusable Coffee Cup",
        description: "A reusable coffee cup made from recycled materials.",
        image: "https://images.pexels.com/photos/5584165/pexels-photo-5584165.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },
    {
        name: "Portable Solar Charger",
        description: "A small solar charger for your gadgets.",
        image: "https://images.pexels.com/photos/11085029/pexels-photo-11085029.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 1000,
    },

    // หลัก 10,000 บาท
    {
        name: "Home Solar Panel Kit",
        description: "A solar panel kit for home use.",
        image: "https://images.pexels.com/photos/4254167/pexels-photo-4254167.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10000,
    },
    {
        name: "Electric Bicycle",
        description: "An eco-friendly electric bicycle.",
        image: "https://images.pexels.com/photos/2582934/pexels-photo-2582934.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10000,
    },
    {
        name: "Rainwater Harvesting System",
        description: "A system for harvesting and reusing rainwater.",
        image: "https://images.pexels.com/photos/4806931/pexels-photo-4806931.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10000,
    },
    {
        name: "Energy-Efficient Air Conditioner",
        description: "An air conditioner with high energy efficiency.",
        image: "https://images.pexels.com/photos/3930061/pexels-photo-3930061.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10000,
    },
    {
        name: "Smart Thermostat",
        description: "A smart thermostat to reduce energy consumption.",
        image: "https://images.pexels.com/photos/5862159/pexels-photo-5862159.jpeg?auto=compress&cs=tinysrgb&w=600",
        priceRange: 10000,
    },
    {
        name: "Compost Tumbler",
        description: "A large compost tumbler for outdoor use.",
        image: "https://images.pexels.com/photos/4754294/pexels-photo-4754294.jpeg?auto=compress&cs=tinysrgb&w=600",
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
