import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kyc" element={<Placeholder title="KYC Review" phase="Phase 1" />} />
        <Route path="/disputes" element={<Placeholder title="Disputes" phase="Phase 4" />} />
        <Route path="/requests" element={<Placeholder title="Requests" phase="Phase 2" />} />
        <Route path="/users" element={<Placeholder title="Users" phase="Phase 1" />} />
        <Route path="/risk" element={<Placeholder title="Risk & Fraud" phase="Phase 6" />} />
        <Route path="*" element={<Placeholder title="Not found" phase="—" />} />
      </Routes>
    </Layout>
  );
}
