const express = require("express")
const router = express.Router();
const authController = require("../controllers/auth-controller")
const authenticate = require("../middlewares/authenticate")
const upload = require("../middlewares/upload")


router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/user", authenticate, authController.currentUser);
//uploadProfilePic
router.post("/upload-avatar", authenticate, upload.single('avatar'), authController.uploadAvatar)

module.exports = router