const express = require("express")
const router = express.Router();
const randomItemsController = require("../controllers/randomItems-controller")
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");


router.post("/getitem", randomItemsController.RandomItems)
//admin
router.post("/create-randomItem", authenticate, upload.single('image'), randomItemsController.AddRandomItem)

//admin edit and del
router.get('/getAll-randomItems', randomItemsController.getAllRandomItems);
router.patch("/edit-randomItem", authenticate, upload.single('image'), randomItemsController.EditRandomItem)
router.delete("/del-randomItem/:id", authenticate, randomItemsController.DelRandomItem)


module.exports = router