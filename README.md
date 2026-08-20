# BRICKSBRAIN-AI — Smart Real Estate Platform 🏠

> AI-powered full-stack real estate platform for India — React.js frontend, Node.js backend, Python ML service, MongoDB, Three.js 3D, Google Maps API, Razorpay payments.


---

## 📁 Project Structure

```
bricksbrain-platform/
│
├── frontend/                          # React.js 18 app
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx                    # Router + lazy loading
│   │   ├── index.css                  # Tailwind + animations
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth + dark/light theme
│   │   ├── api/
│   │   │   └── apiService.js          # Full Axios client
│   │   ├── data/
│   │   │   └── indiaData.js           # 45+ cities, properties, banks
│   │   └── components/
│   │       ├── Auth/AuthModal.jsx     # 3-role signup (Buyer/Owner/Agent)
│   │       ├── Navbar/Navbar.jsx      # Sticky nav, dark mode, user menu
│   │       ├── Sidebar/Sidebar.jsx    # Full sidebar navigation
│   │       ├── Dashboard/             # Hero search, charts, featured listings
│   │       ├── Listings/              # Filterable grid (type, BHK, price, city)
│   │       ├── Compare/               # Search & compare up to 4 properties
│   │       ├── PriceAI/               # XGBoost price predictor + construction cost
│   │       ├── AreaIntel/             # Locality intelligence + circle rates
│   │       ├── Loans/                 # 8-bank EMI calculator + eligibility
│   │       ├── Legal/                 # RERA + ownership chain + download report
│   │       ├── Chat/                  # AI assistant (OpenAI / Claude)
│   │       ├── ThreeD/                # 3D home builder (React Three Fiber)
│   │       ├── Sell/                  # 3-step OLX-style property listing
│   │       ├── Agent/AgentDash.jsx    # Agent CRM — leads, listings, co-broker
│   │       ├── Payment/Payment.jsx    # Razorpay plans + UPI/Card/EMI checkout
│   │       ├── Profile/Profile.jsx    # User profile + saved properties
│   │       └── UI.jsx                 # 15+ shared components
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                           # Node.js + Express + MongoDB
│   ├── server.js                      # Main Express app
│   ├── .env.example                   # All env vars documented
│   ├── config/db.js
│   ├── middleware/auth.js             # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js                    # Full user schema (buyer/seller/agent)
│   │   ├── Property.js                # Full property schema + indexes
│   │   └── Lead.js                    # Agent leads CRM schema
│   ├── routes/
│   │   ├── auth.js                    # Register, login, me, update, change-password
│   │   ├── properties.js              # CRUD + filters + save + contact + text search
│   │   ├── predict.js                 # Calls ML service (with formula fallback)
│   │   ├── area.js                    # Google Maps + OpenWeather + circle rates
│   │   ├── loans.js                   # EMI calc + 8-bank match + apply
│   │   ├── legal.js                   # RERA verification + ownership chain
│   │   ├── chat.js                    # OpenAI GPT-4 / Anthropic Claude
│   │   ├── payment.js                 # Razorpay order + verify + plans
│   │   ├── agent.js                   # Lead CRUD + stats
│   │   └── reports.js                 # Download comparison + EMI reports
│   ├── utils/seed.js                  # DB seeder with sample data
│   ├── package.json
│   └── Dockerfile
│
├── ml/                                # Python FastAPI ML Service
│   ├── main.py                        # All ML endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models_store/                  # Saved .pkl and .h5 model files
│   └── notebooks/
│       ├── train_price_model.py       # XGBoost training script
│       └── train_lstm_forecast.py     # LSTM time-series training
│
├── docker-compose.yml                 # Full stack orchestration
└── .gitignore
```

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended)

```bash
# 1. Clone and enter project
cd bricksbrain-platform

# 2. Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in API keys in both .env files

# 3. Start everything
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:5000
#   ML API    → http://localhost:8000
#   MongoDB   → localhost:27017
```

### Option 2 — Manual (Development)

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env    # add your Google Maps key
npm start               # → http://localhost:3000
```

#### Backend
```bash
cd backend
npm install
cp .env.example .env    # fill in your keys
npm run dev             # → http://localhost:5000

# Seed database with sample data:
node utils/seed.js
```

#### ML Service
```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # → http://localhost:8000

# Train models (optional — service works without trained models via fallback):
python notebooks/train_price_model.py
python notebooks/train_lstm_forecast.py
```

---

## 🔑 Required API Keys

| Key | Purpose | Get it from |
|-----|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | Area intel, distances, geocoding | [console.cloud.google.com](https://console.cloud.google.com) |
| `OPENWEATHER_API_KEY` | Air quality data | [openweathermap.org](https://openweathermap.org/api) |
| `OPENAI_API_KEY` | AI chat assistant | [platform.openai.com](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | AI chat (alternative) | [console.anthropic.com](https://console.anthropic.com) |
| `MONGODB_URI` | Database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| `RAZORPAY_KEY_ID` | Payments | [razorpay.com](https://razorpay.com) |

Enable these **Google Cloud APIs**: Maps JavaScript API, Places API, Distance Matrix API, Geocoding API, Directions API.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (buyer/seller/agent) |
| POST | `/api/auth/login` | Login → JWT token |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/update` | Update profile |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/properties` | List with filters |
| GET  | `/api/properties/featured` | Featured listings |
| GET  | `/api/properties/search?q=` | Full-text search |
| GET  | `/api/properties/:id` | Single property |
| POST | `/api/properties` | Create listing (auth) |
| PUT  | `/api/properties/:id` | Update listing (auth) |
| POST | `/api/properties/:id/save` | Save/unsave |

**Query params**: `city, state, type, listType, sellerType, minPrice, maxPrice, bedrooms, sort, page, limit, search`

### ML Predict
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict/price` | XGBoost price prediction |
| POST | `/api/predict/construction` | Construction cost |
| GET  | `/api/predict/forecast` | LSTM 5-year forecast |

### Area Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/area/intel?locality=&city=` | Full area scorecard |
| POST | `/api/area/distances` | Distance matrix |
| GET  | `/api/area/circle-rate` | Govt circle rates |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loans/match` | EMI + bank matching |
| POST | `/api/loans/apply` | Loan application |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/legal/check?address=` | RERA + legal check |
| POST | `/api/chat` | AI chat (GPT-4/Claude) |
| POST | `/api/payment/order` | Razorpay order |
| POST | `/api/payment/verify` | Payment verification |
| GET  | `/api/agent/leads` | Agent's leads |
| POST | `/api/reports/compare` | Download comparison |

---

## 🤖 ML Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/price` | XGBoost price prediction |
| POST | `/predict/construction` | Cost estimation |
| POST | `/predict/forecast` | LSTM 5yr forecast |
| POST | `/recommend` | Property recommendations |
| POST | `/train/price` | Retrain XGBoost |
| POST | `/train/forecast` | Retrain LSTM |
| GET  | `/health` | Service health |
| GET  | `/docs` | FastAPI Swagger UI |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts |
| 3D Viz | Three.js, React Three Fiber, @react-three/drei |
| State | React Context (Auth + Theme) |
| Backend | Node.js 20, Express.js, Helmet, Morgan |
| Database | MongoDB 7, Mongoose (indexes + text search) |
| Auth | JWT, bcryptjs (12 rounds) |
| ML Service | Python 3.11, FastAPI, XGBoost, TensorFlow/LSTM |
| Maps | Google Maps API, OpenWeather API |
| Payments | Razorpay |
| DevOps | Docker, Docker Compose, Nginx |

---

## 🧪 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bricksbrain.ai | admin123 |
| Buyer | buyer@bricksbrain.ai | buyer123 |
| Agent | agent@bricksbrain.ai | agent123 |
| Seller | seller@bricksbrain.ai | seller123 |

---

## 📈 Roadmap

- [ ] Real-time property alerts via WebSocket
- [ ] WhatsApp notifications (Twilio)
- [ ] Google Maps live embed with property pins
- [ ] RERA state-portal API integration
- [ ] PWA / mobile app (React Native)
- [ ] Property photo upload (Cloudinary)
- [ ] Email notifications (Nodemailer)
- [ ] Admin analytics dashboard

---

## 📄 License

MIT — Free to use and modify for personal and commercial projects.
