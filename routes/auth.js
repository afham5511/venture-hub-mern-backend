const express = require('express');
const { client, db } = require('../utils/mongoDBConnection');
const router = express.Router();

router.post('/register',async (req, res) => {
    try {
        const { phoneNumber, fname, surName, password } = req?.body;
      if (!phoneNumber || !fname || !password || !surName ) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const userExist = await db.collection('users').findOne({phoneNumber});
      if(userExist){
        return res.status(400).json({ message: 'user alredy exist please login' });
      }
      await db.collection('users').insertOne({ phoneNumber, fname, surName, password })

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.post('/login', (req, res) => {
  res.send('User logged in successfully');
});

// Export the router
module.exports = router;
