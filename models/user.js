const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: String,
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String
  },
  googleId: String,
  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
  // FIX: Yahan isVerified add kiya gaya hai taaki naya host default unverified rahe
  isVerified: {
    type: Boolean,
    default: false
  },
  hasNewBookings: { type: Boolean, default: false },
  hasNewFavourites: { type: Boolean, default: false },
  hasNewManageHost: { type: Boolean, default: false }, 
  hasNewHome: { type: Boolean, default: false },
  hasNewHostBookings: {                           // Host ke liye notification
    type: Boolean,
    default: false
  },
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home'
  }]
});

module.exports = mongoose.model('User', userSchema);