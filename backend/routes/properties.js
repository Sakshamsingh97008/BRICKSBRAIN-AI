const express  = require('express');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/properties — list with all filters
router.get('/', async (req, res) => {
  try {
    const {
      city, state, type, listType, sellerType,
      minPrice, maxPrice, bedrooms, minArea, maxArea,
      sort = '-bricksbrainScore', page = 1, limit = 12,
      search, featured,
    } = req.query;

    const filter = { active: true };
    if (city)        filter.city        = { $regex: city, $options: 'i' };
    if (state)       filter.state       = { $regex: state, $options: 'i' };
    if (type)        filter.type        = type;
    if (listType)    filter.listType    = listType;
    if (sellerType)  filter.sellerType  = sellerType;
    if (bedrooms)    filter.bedrooms    = +bedrooms;
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = +minPrice;
      if (maxPrice) filter.price.$lte = +maxPrice;
    }
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = +minArea;
      if (maxArea) filter.area.$lte = +maxArea;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(+skip).limit(+limit),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true, properties, total,
      page: +page, pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/properties/featured
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ active: true, featured: true })
      .sort('-bricksbrainScore').limit(6);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/properties/search?q=...
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, properties: [] });
    const properties = await Property.find(
      { $text: { $search: q }, active: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(10);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    // Increment views
    property.views = (property.views || 0) + 1;
    await property.save({ validateBeforeSave: false });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties — create listing (requires auth)
router.post('/', protect, async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      seller: {
        userId: req.user._id,
        name:   req.user.name,
        phone:  req.user.phone,
        email:  req.user.email,
      },
    });
    res.status(201).json({ success: true, property });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/properties/:id — update listing
router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.seller?.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, property: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.seller?.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    await Property.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties/:id/save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = req.user;
    const id   = req.params.id;
    const isSaved = user.savedProperties.includes(id);
    if (isSaved) {
      user.savedProperties = user.savedProperties.filter(p => p.toString() !== id);
    } else {
      user.savedProperties.push(id);
      await Property.findByIdAndUpdate(id, { $inc: { saves: 1 } });
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: !isSaved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties/:id/contact — log enquiry
router.post('/:id/contact', async (req, res) => {
  try {
    await Property.findByIdAndUpdate(req.params.id, { $inc: { enquiries: 1 } });
    res.json({ success: true, message: 'Enquiry logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
