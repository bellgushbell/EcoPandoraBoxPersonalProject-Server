const express = require("express")

const router = express.Router();
const authController = require("../controllers/auth-controller")
const authenticate = require("../middlewares/authenticate")

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/user", authenticate, authController.currentUser);

module.exports = router