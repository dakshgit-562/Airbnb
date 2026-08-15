const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  photoUrl: String,
  description: String,
  hostPhone: { type: String }, // 👈 यह नई लाइन ऐड करें
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Home', homeSchema);