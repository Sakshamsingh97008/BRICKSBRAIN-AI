import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Toast } from '../UI';
import { paymentAPI } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
  { key:'free',    label:'Free',        price:0,    period:'forever', features:['5 property views/day','Basic search filters','Email support','Area intelligence (3/month)'], color:'slate' },
  { key:'pro',     label:'Pro Buyer',   price:999,  period:'month',   features:['Unlimited views','AI price prediction','Download all reports','Compare unlimited','Priority support','Advanced filters'], color:'brand', highlight:true },
  { key:'agent',   label:'Agent Pro',   price:2499, period:'month',   features:['50 premium listings','Lead management CRM','Co-broker network','Analytics dashboard','Dedicated account manager','API access'], color:'blue' },
  { key:'premium', label:'Enterprise',  price:4999, period:'month',   features:['Everything in Agent Pro','White-label reports','Custom domain','Unlimited API','24/7 phone support','Onboarding support'], color:'purple' },
];

const METHODS = [
  { key:'upi',        icon:'📱', label:'UPI'              },
  { key:'card',       icon:'💳', label:'Credit / Debit'    },
  { key:'netbanking', icon:'🏦', label:'Net Banking'       },
  { key:'emi',        icon:'📅', label:'EMI'               },
];

// Loads the Razorpay Checkout script once and caches the promise so repeated
// calls (e.g. re-opening the page) don't re-inject the <script> tag.
let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function Payment() {
  const { user, isLoggedIn, updateUser } = useAuth();

  const [plan,     setPlan]     = useState('pro');
  const [method,   setMethod]   = useState('upi');
  const [upiId,    setUpiId]    = useState('');
  const [card,     setCard]     = useState({ num:'', name:'', expiry:'', cvv:'' });
  const [bank,     setBank]     = useState('SBI');
  const [step,     setStep]     = useState('plans'); // plans | checkout | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [txn,      setTxn]      = useState(null);
  const [toast,    setToast]    = useState('');

  const selected = PLANS.find(p => p.key === plan);

  const pay = async () => {
    if (!isLoggedIn) {
      setToast('Please log in first to subscribe');
      return;
    }
    setErrorMsg('');
    setStep('processing');

    try {
      const { data: order } = await paymentAPI.createOrder({ plan });
      if (!order.success) throw new Error(order.error || 'Could not create order');

      // ── Dev/test mode — no live Razorpay keys configured on the server ──
      if (order.source === 'mock') {
        await new Promise(r => setTimeout(r, 1200)); // mimic gateway latency
        const { data: verified } = await paymentAPI.verify({
          plan,
          mock: true,
          razorpay_order_id:   order.orderId,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
        });
        if (!verified.success) throw new Error(verified.error || 'Verification failed');
        updateUser({ plan: verified.user?.plan || plan, planExpiresAt: verified.user?.planExpiresAt });
        setTxn(verified.transactionId);
        setStep('success');
        return;
      }

      // ── Live mode — real Razorpay order, open the actual Checkout widget ──
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load Razorpay checkout — check your connection');

      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        order_id:    order.orderId,
        name:        'BRICKSBRAIN-AI',
        description: `${selected?.label} subscription`,
        prefill:     { name: user?.name, email: user?.email, contact: user?.phone },
        theme:       { color: '#16a34a' },
        modal:       { ondismiss: () => setStep('checkout') },
        handler: async (response) => {
          try {
            const { data: verified } = await paymentAPI.verify({
              plan,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (!verified.success) throw new Error(verified.error || 'Payment verification failed');
            updateUser({ plan: verified.user?.plan || plan, planExpiresAt: verified.user?.planExpiresAt });
            setTxn(verified.transactionId);
            setStep('success');
          } catch (err) {
            setErrorMsg(err.response?.data?.error || err.message || 'Payment verification failed');
            setStep('error');
          }
        },
      });

      rzp.on('payment.failed', (resp) => {
        setErrorMsg(resp.error?.description || 'Payment failed');
        setStep('error');
      });

      rzp.open();
      setStep('checkout'); // stay on checkout screen behind the Razorpay modal
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Something went wrong');
      setStep('error');
    }
  };

  const colorsMap = {
    slate:  { border:'border-slate-200 dark:border-slate-700', badge:'', price:'text-slate-900 dark:text-white' },
    brand:  { border:'border-brand-500 shadow-lg shadow-brand-100/50 dark:shadow-brand-900/30', badge:'bg-brand-500', price:'text-brand-700 dark:text-brand-400' },
    blue:   { border:'border-blue-400', badge:'bg-blue-500', price:'text-blue-700 dark:text-blue-400' },
    purple: { border:'border-purple-400', badge:'bg-purple-500', price:'text-purple-700 dark:text-purple-400' },
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Plans &amp; Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Unlock full BRICKSBRAIN-AI features · Secure payments via Razorpay · Cancel anytime</p>
        {user?.plan && user.plan !== 'free' && (
          <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">
            Current plan: {PLANS.find(p => p.key === user.plan)?.label || user.plan}
            {user.planExpiresAt && ` · renews ${new Date(user.planExpiresAt).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {step === 'plans' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(p => {
              const c = colorsMap[p.color];
              return (
                <div key={p.key} onClick={() => setPlan(p.key)}
                  className={`relative bg-white dark:bg-slate-800 rounded-xl p-5 cursor-pointer border-2 transition-all ${c.border} ${plan===p.key?'ring-4 ring-brand-200 dark:ring-brand-900/50':''}`}>
                  {p.highlight && <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${c.badge} text-white text-[11px] font-black px-3 py-1 rounded-full`}>MOST POPULAR</div>}
                  <div className="font-black text-base text-slate-900 dark:text-white mb-2">{p.label}</div>
                  <div className={`text-2xl font-black tracking-tight mb-1 ${c.price}`}>
                    {p.price === 0 ? '₹0' : `₹${p.price.toLocaleString()}`}
                    <span className="text-sm font-medium text-slate-400">/{p.period}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="text-brand-500 font-black mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {plan !== 'free' && (
            <div className="flex justify-center">
              <button onClick={() => setStep('checkout')}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-base rounded-xl transition-all shadow-lg shadow-brand-200/50 dark:shadow-brand-900/30">
                Continue to Payment — ₹{selected?.price?.toLocaleString()}/{selected?.period} →
              </button>
            </div>
          )}
        </>
      )}

      {step === 'checkout' && (
        <div className="max-w-md space-y-4">
          <Card><CardBody>
            <CardTitle>💳 Secure Payment</CardTitle>
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl mb-4 flex justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selected?.label}</span>
              <span className="text-sm font-black text-brand-700 dark:text-brand-400">₹{selected?.price?.toLocaleString()}/{selected?.period}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              {METHODS.map(m => (
                <div key={m.key} onClick={() => setMethod(m.key)}
                  className={`p-3 rounded-xl text-center cursor-pointer border-2 transition-all ${method===m.key?'border-brand-500 bg-brand-50 dark:bg-brand-900/30':'border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className={`text-[11px] font-bold ${method===m.key?'text-brand-700 dark:text-brand-400':'text-slate-400'}`}>{m.label}</div>
                </div>
              ))}
            </div>

            {method === 'upi' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">UPI ID</label>
                <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder="yourname@paytm / phone@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                <p className="text-xs text-slate-400 mt-1">Supports: PhonePe · Google Pay · Paytm · BHIM · Amazon Pay</p>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Card Number</label>
                  <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="1234  5678  9012  3456" maxLength={19} value={card.num} onChange={e => setCard(c=>({...c,num:e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Cardholder Name</label>
                  <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    placeholder="As on card" value={card.name} onChange={e => setCard(c=>({...c,name:e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Expiry</label>
                    <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      placeholder="MM / YY" maxLength={5} value={card.expiry} onChange={e => setCard(c=>({...c,expiry:e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">CVV</label>
                    <input type="password" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      placeholder="•••" maxLength={3} value={card.cvv} onChange={e => setCard(c=>({...c,cvv:e.target.value}))} />
                  </div>
                </div>
                <p className="text-xs text-slate-400">🔒 Card details are entered directly in Razorpay's secure window — BRICKSBRAIN-AI never sees or stores them.</p>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Select Bank</label>
                <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  value={bank} onChange={e => setBank(e.target.value)}>
                  {['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','PNB','Yes Bank','Bank of Baroda'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            )}

            {method === 'emi' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">EMI Plan</label>
                <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                  {[3,6,12].map(m => <option key={m}>No-cost EMI — {m} months · ₹{Math.round((selected?.price||0)/m)}/mo</option>)}
                </select>
              </div>
            )}

            <button onClick={pay} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl transition-all">
              🔒 Pay Securely — ₹{selected?.price?.toLocaleString()}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">🔒 256-bit SSL · Secured by Razorpay · PCI-DSS Compliant</p>

            <button className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600 transition-all" onClick={() => setStep('plans')}>← Back to Plans</button>
          </CardBody></Card>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-slate-700 dark:text-slate-300">Processing payment...</p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-brand-700 dark:text-brand-400 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-2">Welcome to BRICKSBRAIN-AI <strong>{selected?.label}</strong>! Your account has been upgraded.</p>
          {txn && <p className="text-xs text-slate-400 mb-6">Transaction ID: {txn}</p>}
          <button onClick={() => setStep('plans')} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all">
            Go to Dashboard →
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-red-600 mb-2">Payment Failed</h2>
          <p className="text-slate-500 mb-6">{errorMsg || 'Something went wrong while processing your payment.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep('checkout')} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all">
              Try Again
            </button>
            <button onClick={() => setStep('plans')} className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-bold rounded-xl transition-all">
              Back to Plans
            </button>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
