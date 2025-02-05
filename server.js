const express = require('express');
var db = require('./utils/mongoDBConnection.js');
const cors = require('cors')
const app = express();


app.use(express.json());
app.use(cors())


const port = 3000;
const authRoute = require('./routes/auth.js')
const categoriesRoute = require('./routes/categories.js')

app.use('/api/auth',authRoute)
app.use('/api/categories',categoriesRoute)


db.connect((err)=>{
  if(err) console.log('err is: '+ err);
  else console.log('databse connected');
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
