const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping-controller');

router.post('/create', shippingController.createShipping); // Create a new shipping record
router.patch('/update-status', shippingController.updateShippingStatus); // Update shipping status
router.get('/details', shippingController.getShippingDetails); // Get shipping details

module.exports = router;
