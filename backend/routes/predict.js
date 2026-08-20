const express = require('express');
const axios   = require('axios');

const router     = express.Router();
const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// City average price rates (fallback when ML service is down)
const CITY_RATES = {
  Mumbai:18000, Pune:8500, Bengaluru:9500, Hyderabad:7500, Chennai:7000,
  Delhi:8000, Gurugram:9200, Noida:6000, Kolkata:6500, Ahmedabad:5500,
  Jaipur:4800, Chandigarh:7200, Lucknow:4500, Indore:4200, Kochi:6800,
  Surat:5000, Nagpur:4000, Visakhapatnam:5500, Bhopal:3800, Goa:12000,
};

const fallbackPredict = ({ area, floor, ageYears, metroDistKm, city }) => {
  const rate    = CITY_RATES[city] || 5500;
  const fBonus  = floor > 5 ? 1.04 : 1;
  const aPen    = Math.max(0.85, 1 - (ageYears || 0) * 0.005);
  const mPen    = Math.max(0.90, 1 - (metroDistKm || 1) * 0.03);
  const price   = Math.round(area * rate * fBonus * aPen * mPen / 10_000_000 * 10) / 10;
  return { price, lo: Math.round(price * 9.4 * 10) / 10, hi: Math.round(price * 10.6 * 10) / 10 };
};

// POST /api/predict/price
router.post('/price', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE}/predict/price`, req.body, { timeout: 5000 });
    res.json({ success: true, ...response.data, source: 'xgboost_ml' });
  } catch {
    const result = fallbackPredict(req.body);
    res.json({ success: true, ...result, source: 'fallback_formula' });
  }
});

// POST /api/predict/construction
router.post('/construction', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE}/predict/construction`, req.body, { timeout: 5000 });
    res.json({ success: true, ...response.data });
  } catch {
    const { plotAreaSqyd = 100, floors = 1, quality = 'standard' } = req.body;
    const rates  = { standard: 1800, premium: 2400, luxury: 3200 };
    const rate   = rates[quality] || 1800;
    const sqft   = plotAreaSqyd * 9 * (floors + 1);
    const total  = Math.round(sqft * rate / 100000);
    res.json({
      success: true, total, sqft: Math.round(sqft), ratePerSqft: rate, source: 'fallback',
      breakdown: {
        cement: +(total * 0.30).toFixed(1), steel:  +(total * 0.25).toFixed(1),
        bricks: +(total * 0.18).toFixed(1), labour: +(total * 0.20).toFixed(1),
        other:  +(total * 0.07).toFixed(1),
      },
    });
  }
});

// GET /api/predict/forecast?city=Delhi&basePrice=78
router.get('/forecast', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE}/predict/forecast`, { params: req.query, timeout: 5000 });
    res.json({ success: true, ...response.data });
  } catch {
    const base     = +(req.query.basePrice || 78);
    const forecast = Array.from({ length: 6 }, (_, i) => ({
      year:  2025 + i,
      price: Math.round(base * Math.pow(1.08, i) * 10) / 10,
    }));
    res.json({ success: true, forecast, city: req.query.city || 'Delhi', source: 'arima_fallback' });
  }
});

// POST /api/predict/recommend
router.post('/recommend', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE}/recommend`, req.body, { timeout: 5000 });
    res.json({ success: true, ...response.data });
  } catch {
    res.json({ success: true, recommendations: [], source: 'fallback', message: 'ML service unavailable' });
  }
});

module.exports = router;
