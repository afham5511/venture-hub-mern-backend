const express = require('express');
const { ObjectId } = require('mongodb');  // Import ObjectId from 'mongodb'
const db = require('../utils/mongoDBConnection');
const router = express.Router();

// Route for getting the cart products
router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;  // Use `params` to extract the userId from the URL
        const cart = await db().collection('cart').findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json({ products: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/cart', async (req, res) => {
    try {
        const { userId, productId } = req.body;  
        const userObjectId = new ObjectId(userId);
        
        const cart = await db().collection('cart').findOne({ userId: userObjectId });

        if (cart) {
            const isItemInCart = await db().collection('cart').findOne({
                userId: userObjectId,
                'products.productId': productId
            });

            if (isItemInCart) {
                await db().collection('cart').updateOne(
                    { userId: userObjectId, 'products.productId': productId },
                    { $inc: { 'products.$.qty': 1 } }  // Increment the qty field
                );
            } else {
                // If the product doesn't exist, push it into the products array with qty 1
                await db().collection('cart').updateOne(
                    { userId: userObjectId },
                    { $push: { products: { productId, qty: 1 } } }
                );
            }
        } else {
            // If the cart doesn't exist, create a new cart with the productId and qty 1
            await db().collection('cart').insertOne({
                userId: userObjectId,
                products: [{ productId, qty: 1 }]
            });
        }

        res.status(200).json({ message: "Successfully added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route for deleting a product from the cart
router.delete('/cart', async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const userObjectId = new ObjectId(userId);

        // Check if the cart contains the product
        const isQty = await db().collection('cart').findOne({ 
            userId: userObjectId, 
            'products.productId': new ObjectId(productId) 
        });

        let result;

        if (isQty) {
            const qty = isQty.products.find(x => x.productId.toString() === productId);

            if (qty.qty > 1) {
                result = await db().collection('cart').updateOne(
                    { userId: userObjectId, 'products.productId': new ObjectId(productId) },
                    { $inc: { 'products.$.qty': -1 } }  // Decrement the qty by 1
                );
            } else {
                result = await db().collection('cart').updateOne(
                    { userId: userObjectId },
                    { $pull: { products: { productId: new ObjectId(productId) } } }  // Remove the product from the array
                );
            }
        }

        if (!result || result.modifiedCount === 0) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        res.status(200).json({ message: "Product removed from cart or quantity updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
