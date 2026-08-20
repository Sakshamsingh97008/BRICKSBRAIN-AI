const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Core info
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type:        { type: String, enum: ['Flat', 'Villa', 'Plot', 'Commercial', 'PG', 'Farmhouse'], required: true },
  listType:    { type: String, enum: ['Sale', 'Rent', 'Lease'], required: true },

  // Price
  price:       { type: Number, required: true },
  priceUnit:   { type: String, enum: ['total', 'per_month', 'per_sqft'], default: 'total' },
  negotiable:  { type: Boolean, default: true },

  // Location
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  locality:    { type: String, required: true },
  address:     String,
  pincode:     String,
  lat:         Number,
  lng:         Number,

  // Specs
  area:        { type: Number, required: true },
  areaUnit:    { type: String, enum: ['sqft', 'sqyd', 'acres'], default: 'sqft' },
  bedrooms:    { type: Number, default: 0 },
  bathrooms:   { type: Number, default: 0 },
  floor:       { type: Number, default: 0 },
  totalFloors: Number,
  ageYears:    { type: Number, default: 0 },
  facing:      { type: String, enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West', ''] },

  // Amenities
  amenities:   [String],
  furnishing:  { type: String, enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', ''], default: '' },
  parking:     { type: String, enum: ['None', 'Open', 'Covered', ''], default: '' },

  // Media
  images:      [String],
  videoUrl:    String,

  // Scores & ML
  localityScore:  { type: Number, min: 0, max: 100 },
  roi5yr:         Number,
  metroDistKm:    Number,
  bricksbrainScore:    { type: Number, min: 0, max: 100 },

  // Legal
  reraId:      String,
  reraVerified:{ type: Boolean, default: false },
  verified:    { type: Boolean, default: false },

  // Ownership
  sellerType:  { type: String, enum: ['owner', 'agent', 'builder'], default: 'owner' },
  seller: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:   String,
    phone:  String,
    email:  String,
  },

  // Stats
  views:       { type: Number, default: 0 },
  enquiries:   { type: Number, default: 0 },
  saves:       { type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
  active:      { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ── Compound indexes for fast querying ────────────────────────────────────────
propertySchema.index({ city: 1, type: 1, listType: 1, price: 1 });
propertySchema.index({ lat: 1, lng: 1 });
propertySchema.index({ locality: 1, city: 1 });
propertySchema.index({ bricksbrainScore: -1 });
propertySchema.index({ createdAt: -1 });

// ── Text search index ─────────────────────────────────────────────────────────
propertySchema.index({ title: 'text', locality: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
