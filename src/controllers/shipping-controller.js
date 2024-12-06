const prisma = require('../configs/prisma');

// Create a new shipping record
exports.createShipping = async (req, res, next) => {
    try {
        const { userId, addressId, receivedItemId } = req.body;

        console.log('Request Body:', req.body);

        const newShipping = await prisma.shipping.create({
            data: {
                userId: userId || null,
                addressId,
                receivedItemId,
                status: 'PENDING',
            },
        });

        res.status(201).json({ message: 'Shipping created successfully.', shipping: newShipping });
    } catch (error) {
        console.error('Error in createShipping:', error);
        next(error);
    }
};

// Update shipping status
exports.updateShippingStatus = async (req, res, next) => {
    try {
        const { shippingId, status } = req.body;

        const updatedShipping = await prisma.shipping.update({
            where: { id: shippingId },
            data: { status },
        });

        res.json({ message: 'Shipping status updated successfully.', shipping: updatedShipping });
    } catch (error) {
        next(error);
    }
};

// Get shipping details by user or guest
exports.getShippingDetails = async (req, res, next) => {
    try {
        const { userId } = req.query;

        const shippingDetails = await prisma.shipping.findMany({
            where: {
                userId: userId || null,
            },
            include: {
                address: true,
                receivedItem: {
                    include: {
                        randomItem: true,
                    },
                },
            },
        });

        res.json(shippingDetails);
    } catch (error) {
        next(error);
    }
};
