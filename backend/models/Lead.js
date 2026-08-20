const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  agent:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  email:    String,
  city:     String,
  budget:   String,
  interest: String,
  status:   { type: String, enum: ['hot', 'warm', 'cold', 'converted', 'lost'], default: 'warm' },
  notes:    String,
  followUpDate: Date,
  source:   { type: String, enum: ['bricksbrain', 'referral', 'walk-in', 'social', 'portal', 'other'], default: 'bricksbrain' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
