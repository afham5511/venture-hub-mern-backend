const express = require('express');
const { ObjectId } = require('mongodb'); 
const db = require('../utils/mongoDBConnection.js');
const router = express.Router();

router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params; 
        const cart = await db.get().collection('cart').aggregate([
            { '$match': { 'userId': new ObjectId(userId) } },  
            { '$unwind': { 'path': '$products' } }, 
            { '$lookup': { 
                'from': 'categories', 
                'localField': 'products.productId', 
                'foreignField': 'items._id', 
                'as': 'category' 
            }},
            { '$unwind': { 'path': '$category' } } 
        ]).toArray();

        if (!cart || cart.length === 0) {
            return res.status(404).json({ message: "Cart not found" });
        }

       
        const cartItems = cart.flatMap(x => 
            x.category.items
                .filter(item => item._id.equals(x.products.productId))
                .map(item => ({
                    ...item, 
                    qty: x.products.qty 
                }))
        );


    
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
                    { $inc: { 'products.$.qty': 1 } }  
                );
            } else {
               
                await db.get().collection('cart').updateOne(
                    { userId: userObjectId },
                    { $push: { products: { productId, qty: 1 } } }
                );
            }
        } else {
            
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


router.delete('/cart', async (req, res) => {
    try {
        const { userId, productId } = req.query;
        const userObjectId = new ObjectId(userId);

       
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
                    { $inc: { 'products.$.qty': -1 } }  
                );
            } else {
                result = await db.get().collection('cart').updateOne(
                    { userId: userObjectId },
                    { $pull: { products: { productId: new ObjectId(productId) } } } 
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
