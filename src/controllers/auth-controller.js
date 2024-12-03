const prisma = require("../configs/prisma")
const createError = require("../utility/createError")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


exports.register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone, gender } = req.body
        // ตรวจสอบ email ซ้ำ
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw createError(400, "Email already in use");
        }

        // เข้ารหัส password
        const hashedPassword = await bcrypt.hash(password, 10) //10 is salt

        // บันทึกข้อมูลผู้ใช้ใหม่ในฐานข้อมูล
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                gender,
            }, select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                gender: true,
            },
        })


        res.status(201).json({ message: "User registered successfully", user });

    } catch (error) {
        next(error)
    }


}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // ตรวจสอบว่า email มีอยู่ในระบบหรือไม่
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw createError(400, "Invalid email or password");
        }

        // ตรวจสอบ password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw createError(400, "Invalid email or password");
        }

        // สร้าง token JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY,
            { expiresIn: "1d" }
        )

        res.json({ message: "Login successful", token });

    } catch (error) {
        next(error)
    }


}

exports.currentUser = async (req, res, next) => {
    try {
        // console.log(req.user);
        // ตรวจสอบว่า req.user มีค่าและมี email และ id หรือไม่
        if (!req.user || !req.user.email || !req.user.id) {
            return res.status(400).json({ message: "User information is missing" });
        }

        const email = req.user.email;
        const id = req.user.id;


        const member = await prisma.user.findFirst({
            where: {
                email: email,
                id: id
            },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        // ตรวจสอบว่าเจอผู้ใช้หรือไม่
        if (!member) {
            return res.status(404).json({ message: "User not found" });
        }

        // ส่งข้อมูลผู้ใช้กลับไปยัง client .data.member
        res.json({ user: member });
    } catch (err) {

        console.error(err);
        next(err);
    }
};