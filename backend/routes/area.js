const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const MAPS_KEY       = process.env.GOOGLE_MAPS_API_KEY;
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

// Fallback city circle rates (₹/sqft)
const CIRCLE_RATES = {
  'Dwarka':        { ratePerSqft:6900, zone:'C' },
  'Rohini':        { ratePerSqft:5500, zone:'D' },
  'Vasant Kunj':   { ratePerSqft:8500, zone:'A' },
  'Saket':         { ratePerSqft:9000, zone:'A' },
  'Gurugram':      { ratePerSqft:7800, zone:'A' },
  'Noida':         { ratePerSqft:5200, zone:'B' },
  'Greater Noida': { ratePerSqft:4200, zone:'C' },
  'Bandra':        { ratePerSqft:22000, zone:'A' },
  'Powai':         { ratePerSqft:14000, zone:'B' },
  'Andheri':       { ratePerSqft:15000, zone:'B' },
  'Whitefield':    { ratePerSqft:8500, zone:'B' },
  'Koramangala':   { ratePerSqft:12000, zone:'A' },
  'Gachibowli':    { ratePerSqft:7200, zone:'B' },
  'Banjara Hills': { ratePerSqft:9500, zone:'A' },
  'Koregaon Park': { ratePerSqft:8000, zone:'A' },
  'Default':       { ratePerSqft:5000, zone:'C' },
};

const getCircleRate = (locality, city) => {
  const key = Object.keys(CIRCLE_RATES).find(k => locality?.includes(k) || city?.includes(k));
  return key ? CIRCLE_RATES[key] : CIRCLE_RATES['Default'];
};

// GET /api/area/intel?locality=Dwarka+Sec+12&city=Delhi
router.get('/intel', async (req, res) => {
  try {
    const { locality, city } = req.query;
    if (!locality || !city) return res.status(400).json({ error: 'locality and city are required' });

    const results = { locality, city };

    // 1. Geocode
    if (MAPS_KEY) {
      const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address: `${locality}, ${city}, India`, key: MAPS_KEY },
      });
      const loc = geoRes.data.results[0]?.geometry.location;
      if (loc) {
        results.coords = loc;

        // 2. Nearby places
        const placeTypes = ['school', 'hospital', 'supermarket', 'subway_station', 'gas_station'];
        const nearbyData = await Promise.all(placeTypes.map(type =>
          axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: { location: `${loc.lat},${loc.lng}`, radius: 1500, type, key: MAPS_KEY },
          }).then(r => ({ type, count: r.data.results.length, results: r.data.results.slice(0, 3) }))
        ));
        nearbyData.forEach(n => { results[n.type + '_count'] = n.count; });

        // 3. Air quality (OpenWeather)
        if (OPENWEATHER_KEY) {
          const aqiRes = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${loc.lat}&lon=${loc.lng}&appid=${OPENWEATHER_KEY}`
          );
          const aqi = aqiRes.data.list[0]?.main.aqi;
          results.airQuality = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi] || 'Moderate';
          results.aqiValue   = aqi;
        }
      }
    }

    // Fallback if no API key
    if (!results.coords) {
      results.airQuality   = city === 'Delhi' ? 'Moderate' : city === 'Mumbai' ? 'Fair' : 'Good';
      results.school_count = 3;
      results.hospital_count = 2;
      results.supermarket_count = 4;
      results.subway_station_count = 1;
    }

    // 4. Circle rate
    const circleData = getCircleRate(locality, city);
    results.circleRate = circleData;

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/area/distances { origin, destinations: [] }
router.post('/distances', async (req, res) => {
  try {
    const { origin, destinations } = req.body;
    if (!MAPS_KEY) {
      return res.json({
        success: true,
        results: destinations.map((d, i) => ({
          destination: d,
          distance: `${(Math.random() * 3 + 0.3).toFixed(1)} km`,
          duration: `${Math.floor(Math.random() * 15 + 3)} min`,
        })),
        source: 'mock',
      });
    }
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: { origins: origin, destinations: destinations.join('|'), key: MAPS_KEY, units: 'metric' },
    });
    const elements = response.data.rows[0].elements;
    const results  = destinations.map((dest, i) => ({
      destination: dest,
      distance:    elements[i].distance?.text || 'N/A',
      duration:    elements[i].duration?.text || 'N/A',
    }));
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/area/circle-rate?locality=Bandra&city=Mumbai
router.get('/circle-rate', (req, res) => {
  const { locality, city } = req.query;
  const data = getCircleRate(locality, city);
  res.json({ success: true, locality, city, ...data, lastUpdated: '2024-Q4' });
});

module.exports = router;
