const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Item schema
const itemSchema = new Schema({
 
  title: {
    type: String,
    required: true
  },
  imageUrl1: {
    type: String,
    required: true
  },
  imageUrl2: {
    type: String,
    required: true
  },
  imageUrl3: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  strikeprice:{
    type: String,
    required: true
  }
 
});

// Define the Category schema
const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
});

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;