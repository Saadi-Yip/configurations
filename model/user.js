// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  c_user: String,
  xs: String,
  
});

module.exports = mongoose.model('User', userSchema);
