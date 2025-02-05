const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

  const mongoURI = 'mongodb+srv://afhamali5477:afham@cluster0.avyta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/';

const state = {}

const dbName = process.env.DATABASE_NAME || 'ventureHub'
const client = new MongoClient(mongoURI)
module.exports.connect = async function (done) {
  // Use connect method to connect to the server
  await client.connect((err,data)=>{
      
      if(err) return done(err)
      state.db=client.db(dbName)
     

  })
  state.db=client.db(dbName)
  done()

}


mongoose.connect(mongoURI,{dbName})
    .then(() => {
        console.log("Connected Established!")
    })

module.exports.get= function (){
  return state.db
}