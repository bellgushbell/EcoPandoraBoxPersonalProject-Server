const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address-controller');

router.get('/get-address', addressController.getAddress);
router.post('/save-address', addressController.saveAddress);

module.exports = router;
