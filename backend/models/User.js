const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Name is required'], trim: true },
  email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone:    { type: String, trim: true },
  role:     { type: String, enum: ['buyer', 'seller', 'agent', 'admin'], default: 'buyer' },
  city:     { type: String, trim: true },
  state:    { type: String, trim: true },
  avatar:   { type: String, default: '' },
  verified: { type: Boolean, default: false },

  // Buyer preferences
  preferences: {
    budget:    { min: Number, max: Number },
    cities:    [String],
    types:     [String],
    bedrooms:  Number,
    listType:  { type: String, enum: ['Sale', 'Rent', 'Any'], default: 'Any' },
  },

  // Saved/wishlist properties
  savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],

  // Agent-specific
  agentProfile: {
    licenseNo:   String,
    speciality:  String,
    experience:  Number,
    languages:   [String],
    rating:      { type: Number, default: 0 },
    totalDeals:  { type: Number, default: 0 },
    bio:         String,
  },

  // Subscription
  plan:          { type: String, enum: ['free', 'pro', 'agent', 'premium'], default: 'free' },
  planExpiresAt: Date,

  // Meta
  lastLogin:     Date,
  isActive:      { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ── Indexes ───────────────────────────────────────────────────────────────────
// (email index comes from `unique: true` above; no need to redeclare it)
userSchema.index({ city: 1, role: 1 });

// ── Hash password on save ─────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Remove sensitive fields from JSON output ──────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
