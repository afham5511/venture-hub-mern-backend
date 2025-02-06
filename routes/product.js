const express = require('express');
const db  = require('../utils/mongoDBConnection');
const router = express.Router();

router.get('/cart',async (req,res)=>{
    try {
        const
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "internal server error"
        })
    }
})

module.exports = router;
