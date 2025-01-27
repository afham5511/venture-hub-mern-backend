const express = require('express');
const db  = require('../utils/mongoDBConnection');
const router = express.Router();

router.post('/register',async (req, res) => {
    try {
        const { phoneNumber, fname, surName, password } = req?.body;
      if (!phoneNumber || !fname || !password || !surName ) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const userExist = await  db.get().collection('users').findOne({phoneNumber});
      if(userExist){
        return res.status(400).json({ message: 'user alredy exist please login' });
      }
      await db.get().collection('users').insertOne({ phoneNumber, fname, surName, password })

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.post('/login',async (req, res) => {
 try {
  const{phoneNumber,password}=req?.body;
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const userExist = await  db.get().collection('users').findOne({phoneNumber});
  if(!userExist){
    return res.status(400).json({ message: 'user alredy exist please signup' });
  }
  const userValidate = await  db.get().collection('users').findOne({phoneNumber,password});
  if(!userValidate){
    return res.status(400).json({ message: 'invalid credential' });
  }
  delete userValidate.password
  res.status(201).json({ message: 'User login successfull',user:userValidate });

 } catch (error) {
  console.error('Error login user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
  
 }
});

module.exports = router;
