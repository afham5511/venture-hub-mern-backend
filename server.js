const express = require('express');
const { connectDB } = require('./utils/mongoDBConnection');

const app = express();

connectDB();


const port = 3000;
const authRoute = require('./routes/auth.js')

app.use('/api/auth',authRoute)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
