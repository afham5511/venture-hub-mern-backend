const express = require('express');
const { ObjectId } = require('mongodb');  // Import ObjectId from 'mongodb.get'
const db = require('../utils/mongoDBConnection.js');
const router = express.Router();

router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;  // Extract userId from URL
        const cart = await db.get().collection('cart').aggregate([
            { '$match': { 'userId': new ObjectId(userId) } },  // Match by userId
            { '$unwind': { 'path': '$products' } },  // Unwind the products array
            { '$lookup': { 
                'from': 'categories', 
                'localField': 'products.productId', 
                'foreignField': 'items._id', 
                'as': 'category' 
            }},
            { '$unwind': { 'path': '$category' } }  // Unwind category array to match the product
        ]).toArray();

        if (!cart || cart.length === 0) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Filter products that exist in the category's items array
        const cartItems = cart.flatMap(x => 
            x.category.items
                .filter(item => item._id.equals(x.products.productId))
                .map(item => ({
                    ...item,  // Product details
                    qty: x.products.qty  // Add the quantity from the cart
                }))
        );


        // Return filtered cart items
        res.status(200).json({ products: cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});




router.post('/cart', async (req, res) => {
    try {
        const { userId, product } = req.body;  
        const userObjectId = new ObjectId(userId);
        const productId = new ObjectId(product)
        
        const cart = await db.get().collection('cart').findOne({ userId: userObjectId });

        if (cart) {
            const isItemInCart = await db.get().collection('cart').findOne({
                userId: userObjectId,
                'products.productId': productId
            });

            if (isItemInCart) {
                await db.get().collection('cart').updateOne(
                    { userId: userObjectId, 'products.productId': productId },
                    { $inc: { 'products.$.qty': 1 } }  // Increment the qty field
                );
            } else {
                // If the product doesn't exist, push it into the products array with qty 1
                await db.get().collection('cart').updateOne(
                    { userId: userObjectId },
                    { $push: { products: { productId, qty: 1 } } }
                );
            }
        } else {
            // If the cart doesn't exist, create a new cart with the productId and qty 1
            await db.get().collection('cart').insertOne({
                userId: userObjectId,
                products: [{ productId, qty: 1 }]
            });
        }

        res.status(201).json({ message: "Successfully added to cart" });
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
        const isQty = await db.get().collection('cart').findOne({ 
            userId: userObjectId, 
            'products.productId': new ObjectId(productId) 
        });

        let result;

        if (isQty) {
            const qty = isQty.products.find(x => x.productId.toString() === productId);

            if (qty.qty > 1) {
                result = await db.get().collection('cart').updateOne(
                    { userId: userObjectId, 'products.productId': new ObjectId(productId) },
                    { $inc: { 'products.$.qty': -1 } }  // Decrement the qty by 1
                );
            } else {
                result = await db.get().collection('cart').updateOne(
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
