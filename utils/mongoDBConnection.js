const { MongoClient } = require('mongodb');
const { moveMessagePortToContext } = require('worker_threads');

const mongoURI = 'mongodb+srv://afhamali5477:afham@cluster0.avyta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = await client.db('ventureHub')
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = {
  connectDB,
  client,
  db
};