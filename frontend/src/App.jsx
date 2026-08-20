import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy-loaded pages for code splitting
const Dashboard  = lazy(() => import('./components/Dashboard/Dashboard'));
const Listings   = lazy(() => import('./components/Listings/Listings'));
const Compare    = lazy(() => import('./components/Compare/Compare'));
const PriceAI    = lazy(() => import('./components/PriceAI/PriceAI'));
const AreaIntel  = lazy(() => import('./components/AreaIntel/AreaIntel'));
const Loans      = lazy(() => import('./components/Loans/Loans'));
const Legal      = lazy(() => import('./components/Legal/Legal'));
const Chat       = lazy(() => import('./components/Chat/Chat'));
const ThreeD     = lazy(() => import('./components/ThreeD/ThreeD'));
const Sell       = lazy(() => import('./components/Sell/Sell'));
const AgentDash  = lazy(() => import('./components/Agent/AgentDash'));
const Payment    = lazy(() => import('./components/Payment/Payment'));
const Profile    = lazy(() => import('./components/Profile/Profile'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<Dashboard />}  />
              <Route path="listings"   element={<Listings />}   />
              <Route path="compare"    element={<Compare />}    />
              <Route path="predict"    element={<PriceAI />}    />
              <Route path="area"       element={<AreaIntel />}  />
              <Route path="loans"      element={<Loans />}      />
              <Route path="legal"      element={<Legal />}      />
              <Route path="chat"       element={<Chat />}       />
              <Route path="3d"         element={<ThreeD />}     />
              <Route path="sell"       element={<Sell />}       />
              <Route path="agent"      element={<AgentDash />}  />
              <Route path="payment"    element={<Payment />}    />
              <Route path="profile"    element={<Profile />}    />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
