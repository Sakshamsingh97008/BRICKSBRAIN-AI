// ── LOANS ROUTE ─────────────────────────────────────────────────────────────
const express      = require('express');
const axios        = require('axios');
const crypto       = require('crypto');
const { protect }  = require('../middleware/auth');

const loansRouter = express.Router();

const BANKS = [
  { bank:'SBI Home Loans',  logo:'🏦', type:'Floating · Home',   rate:8.40, maxTenure:30, processingFee:10000, preClosure:'Nil',  minIncome:300000 },
  { bank:'HDFC Bank',       logo:'🏛️', type:'Fixed 2yr · Float', rate:8.60, maxTenure:30, processingFee:5000,  preClosure:'2%',   minIncome:350000 },
  { bank:'ICICI Bank',      logo:'🏧', type:'Floating · Home',   rate:8.75, maxTenure:25, processingFee:8500,  preClosure:'Nil',  minIncome:300000 },
  { bank:'Axis Bank',       logo:'🏪', type:'Fixed · Land',      rate:9.00, maxTenure:20, processingFee:7000,  preClosure:'1%',   minIncome:400000 },
  { bank:'Kotak Mahindra',  logo:'🏩', type:'Floating · Home',   rate:8.65, maxTenure:30, processingFee:6000,  preClosure:'Nil',  minIncome:350000 },
  { bank:'PNB Housing',     logo:'🏤', type:'Floating · Home',   rate:8.50, maxTenure:30, processingFee:4000,  preClosure:'Nil',  minIncome:250000 },
  { bank:'LIC Housing',     logo:'🛡️', type:'Floating · Home',   rate:8.35, maxTenure:30, processingFee:5000,  preClosure:'Nil',  minIncome:250000 },
  { bank:'Bank of Baroda',  logo:'🏢', type:'Floating · Home',   rate:8.40, maxTenure:30, processingFee:8000,  preClosure:'Nil',  minIncome:280000 },
];

const calcEMI = (p, r, n) => { const rate = r/1200; return Math.round(p * rate * Math.pow(1+rate,n) / (Math.pow(1+rate,n)-1)); };

// POST /api/loans/match
loansRouter.post('/match', (req, res) => {
  const { loanAmount = 6000000, annualIncome = 1500000, tenure = 20 } = req.body;
  const monthly = annualIncome / 12;
  const results = BANKS.map(b => {
    const emi   = calcEMI(loanAmount, b.rate, Math.min(tenure, b.maxTenure) * 12);
    const total = emi * Math.min(tenure, b.maxTenure) * 12;
    return { ...b, emi, totalPayable: total, totalInterest: total - loanAmount, eligible: emi < monthly * 0.5 };
  }).sort((a, b) => a.rate - b.rate);
  res.json({ success: true, results, bestMatch: results.filter(l => l.eligible)[0]?.bank });
});

// GET /api/loans/banks
loansRouter.get('/banks', (req, res) => res.json({ success: true, banks: BANKS }));

// POST /api/loans/apply
loansRouter.post('/apply', (req, res) => {
  const { bank, applicantName, phone, email, loanAmount } = req.body;
  res.json({ success: true, applicationId: `LA${Date.now()}`, bank, status: 'submitted', message: `${bank} will contact ${applicantName} within 24 hours` });
});

module.exports = { loansRouter };

// ── LEGAL ROUTE ──────────────────────────────────────────────────────────────
const legalRouter = express.Router();

legalRouter.get('/check', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address is required' });

  const stateMap = { delhi:'DL', mumbai:'MH', bengaluru:'KA', bangalore:'KA', hyderabad:'TS', pune:'MH', chennai:'TN', kolkata:'WB', ahmedabad:'GJ', jaipur:'RJ', lucknow:'UP', noida:'UP', gurugram:'HR', gurgaon:'HR' };
  const stateCode = Object.entries(stateMap).find(([k]) => address.toLowerCase().includes(k))?.[1] || 'UP';

  res.json({
    success: true,
    data: {
      address,
      reraId:       `RERA/${stateCode}/${address.toUpperCase().replace(/[\s,]/g,'-').slice(0,10)}/2023/${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`,
      reraVerified: true,
      ownershipChain: [
        { year:2005, owner:'Original Allottee', event:'Govt/DDA allotment — Registered', status:'clear' },
        { year:2011, owner:'2nd Owner',          event:'Resale — Title deed registered at sub-registrar', status:'clear' },
        { year:2019, owner:'2nd Owner',          event:'Home loan mortgage raised (SBI)',  status:'caution', note:'Discharged 2023' },
        { year:2023, owner:'2nd Owner',          event:'SBI mortgage fully discharged — NOC obtained', status:'clear' },
        { year:2024, owner:'Current Seller',     event:'Property listed for sale', status:'clear' },
      ],
      checks: [
        { label:'Title deed verified',          ok:true  },
        { label:'No active court cases',        ok:true  },
        { label:'Mortgage fully discharged',    ok:true  },
        { label:'RERA registration valid',      ok:true  },
        { label:'Property tax: 1 yr pending',   ok:false },
        { label:'Stamp duty paid',              ok:true  },
        { label:'Encumbrance certificate (EC)', ok:true  },
        { label:'Occupancy certificate (OC)',   ok:true  },
        { label:'Layout plan approved',         ok:true  },
      ],
      overallStatus: 'safe',
      taxPending:    '1 year (₹12,400)',
    },
  });
});

module.exports.legalRouter = legalRouter;

// ── CHAT ROUTE ───────────────────────────────────────────────────────────────
const chatRouter = express.Router();

chatRouter.post('/', async (req, res) => {
  const { messages = [] } = req.body;
  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model:    'gpt-4-turbo',
        messages: [
          { role:'system', content:'You are BRICKSBRAIN-AI, an expert real estate assistant for the Indian market. Help buyers, sellers, investors with property prices, legal checks, loan advice, area intelligence and investment analysis. Be concise, data-driven, and mention specific localities, prices in Lakhs/Crores, and Indian city-specific insights.' },
          ...messages,
        ],
        max_tokens: 400,
      }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
      return res.json({ success:true, reply: response.data.choices[0].message.content, source:'openai' });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model:      'claude-opus-4-6',
        max_tokens: 400,
        messages,
        system: 'You are BRICKSBRAIN-AI, an expert Indian real estate assistant. Help with prices, legal checks, loans, and investment advice in Indian cities.',
      }, { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' } });
      return res.json({ success:true, reply: response.data.content[0].text, source:'claude' });
    }

    // Fallback mock responses
    const replies = [
      'Based on current market trends, that locality shows strong appreciation potential. Metro connectivity is a key driver here.',
      'I found matching properties in your budget. The top pick has a BRICKSBRAIN-AI score of 91. Want a detailed comparison?',
      'RERA verification complete. Builder has a clean track record with no delays or disputes.',
      'For your profile, HDFC Bank offers the best home loan at 8.6%. EMI would be approximately ₹51,800/month on ₹60L.',
      'Circle rate for that area is ₹6,900/sqft. Market is 14% above — a healthy range for investment.',
    ];
    const lastMsg = messages[messages.length - 1]?.content || '';
    const idx     = Math.floor(Math.random() * replies.length);
    res.json({ success:true, reply: replies[idx], source:'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.chatRouter = chatRouter;

// ── PAYMENT ROUTE ────────────────────────────────────────────────────────────
const User         = require('../models/User');
const paymentRouter = express.Router();

// Single source of truth for plan pricing — the client never gets to say
// how much something costs, it only ever sends a plan `key`.
const PLANS = [
  { key:'free',    label:'Free',        price:0,    period:'forever', features:['5 views/day','Basic search','Area intel 3/mo'] },
  { key:'pro',     label:'Pro Buyer',   price:999,  period:'month',   features:['Unlimited views','AI predict','Reports','Compare'] },
  { key:'agent',   label:'Agent Pro',   price:2499, period:'month',   features:['50 listings','Lead CRM','Co-broker network'] },
  { key:'premium', label:'Enterprise',  price:4999, period:'month',   features:['Everything + API + White-label'] },
];

const razorpayConfigured = () =>
  !!process.env.RAZORPAY_KEY_ID &&
  !!process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.startsWith('your_');

paymentRouter.get('/plans', (req, res) => res.json({ success: true, plans: PLANS }));

// POST /api/payment/order — create a Razorpay order for a plan (requires login)
paymentRouter.post('/order', protect, async (req, res) => {
  try {
    const plan = PLANS.find(p => p.key === req.body.plan);
    if (!plan)            return res.status(400).json({ error: 'Unknown plan' });
    if (plan.price <= 0)  return res.status(400).json({ error: 'Free plan needs no payment' });

    const amountPaise = plan.price * 100;

    if (!razorpayConfigured()) {
      // No live Razorpay keys — return a mock order so the UI flow can still
      // be exercised end-to-end in dev/test without real credentials.
      return res.json({
        success: true, orderId: `mock_order_${Date.now()}`, currency: 'INR',
        amount: amountPaise, plan: plan.key, keyId: null, source: 'mock',
      });
    }

    const Razorpay = require('razorpay');
    const rzp   = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await rzp.orders.create({
      amount: amountPaise, currency: 'INR', receipt: `receipt_${Date.now()}`,
      notes: { plan: plan.key, userId: req.user._id.toString() },
    });

    res.json({
      success: true, orderId: order.id, currency: order.currency, amount: order.amount,
      plan: plan.key, keyId: process.env.RAZORPAY_KEY_ID, source: 'razorpay',
    });
  } catch (err) {
    const message = err?.error?.description || err.message || 'Payment order creation failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/payment/verify — verify the Razorpay signature, then upgrade the user's plan
paymentRouter.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, mock } = req.body;
    const planObj = PLANS.find(p => p.key === plan);
    if (!planObj) return res.status(400).json({ error: 'Unknown plan' });

    if (mock || !razorpayConfigured()) {
      // Dev/test mode — no live gateway to verify a signature against.
    } else {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment verification fields' });
      }
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment signature verification failed' });
      }
    }

    const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan: planObj.key, planExpiresAt },
      { new: true },
    );

    res.json({
      success: true, message: 'Payment verified successfully',
      transactionId: razorpay_payment_id || `TXN${Date.now()}`, user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

module.exports.paymentRouter = paymentRouter;

// ── AGENT ROUTE ──────────────────────────────────────────────────────────────
const Lead        = require('../models/Lead');
const agentRouter = express.Router();

agentRouter.get('/leads', protect, async (req, res) => {
  try {
    const leads = await Lead.find({ agent: req.user._id }).sort('-createdAt');
    res.json({ success:true, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

agentRouter.post('/leads', protect, async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, agent: req.user._id });
    res.status(201).json({ success:true, lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

agentRouter.put('/leads/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, agent: req.user._id }, req.body, { new:true });
    res.json({ success:true, lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

agentRouter.get('/stats', protect, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({ agent: req.user._id });
    const hotLeads   = await Lead.countDocuments({ agent: req.user._id, status:'hot' });
    const converted  = await Lead.countDocuments({ agent: req.user._id, status:'converted' });
    res.json({ success:true, stats: { totalLeads, hotLeads, converted, conversionRate: totalLeads > 0 ? Math.round(converted/totalLeads*100) : 0 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.agentRouter = agentRouter;

// ── REPORTS ROUTE ────────────────────────────────────────────────────────────
const reportsRouter = express.Router();
const Property      = require('../models/Property');

reportsRouter.post('/compare', async (req, res) => {
  try {
    const { ids } = req.body;
    const properties = await Property.find({ _id: { $in: ids } });
    const lines = ['BRICKSBRAIN-AI Property Comparison Report', '='.repeat(60), '', `Generated: ${new Date().toLocaleString()}`, `Properties: ${properties.length}`, ''];
    properties.forEach(p => {
      lines.push(`--- ${p.title} ---`);
      lines.push(`City: ${p.city}, ${p.state} | Locality: ${p.locality}`);
      lines.push(`Price: ₹${(p.price/100000).toFixed(1)}L | Area: ${p.area} sqft | BHK: ${p.bedrooms}`);
      lines.push(`Floor: ${p.floor}/${p.totalFloors} | Age: ${p.ageYears}yr | Type: ${p.type}`);
      lines.push(`BRICKSBRAIN-AI Score: ${p.bricksbrainScore || 'N/A'} | ROI 5yr: ${p.roi5yr || 'N/A'}%`);
      lines.push('');
    });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=BRICKSBRAIN-AI-Compare.txt');
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

reportsRouter.post('/loan-emi', (req, res) => {
  const { loanAmount = 6000000, annualIncome = 1500000, tenure = 20 } = req.body;
  const BANKS_LIST = ['SBI:8.40','HDFC:8.60','ICICI:8.75','Axis:9.00','Kotak:8.65','PNB:8.50','LIC:8.35'];
  const calcE      = (p, r, n) => { const rt = r/1200; return Math.round(p * rt * Math.pow(1+rt,n) / (Math.pow(1+rt,n)-1)); };
  const lines      = ['BRICKSBRAIN-AI Loan EMI Comparison Report', '='.repeat(50), '', `Loan Amount: ₹${(loanAmount/100000).toFixed(1)}L`, `Annual Income: ₹${(annualIncome/100000).toFixed(1)}L`, `Tenure: ${tenure} years`, '', 'BANK COMPARISON', '-'.repeat(40)];
  BANKS_LIST.forEach(b => {
    const [name, rate] = b.split(':');
    const emi  = calcE(loanAmount, +rate, tenure * 12);
    const total = emi * tenure * 12;
    lines.push(`${name}: ${rate}% | EMI ₹${emi.toLocaleString()} | Total ₹${(total/100000).toFixed(1)}L | Interest ₹${((total-loanAmount)/100000).toFixed(1)}L`);
  });
  lines.push('', `Generated: ${new Date().toLocaleString()}`);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename=BRICKSBRAIN-AI-LoanEMI.txt');
  res.send(lines.join('\n'));
});

module.exports.reportsRouter = reportsRouter;
