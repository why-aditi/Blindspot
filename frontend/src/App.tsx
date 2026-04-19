import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Audit from './pages/Audit';
import FairScore from './pages/FairScore';
import LandingPage from './components/landing/LandingPage';

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-textPrimary font-dm">
      <Navigation />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/score" element={<FairScore />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
