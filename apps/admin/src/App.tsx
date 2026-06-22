import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { KycReview } from './pages/KycReview';
import { Users } from './pages/Users';
import { Requests } from './pages/Requests';
import { Transactions } from './pages/Transactions';
import { Disputes } from './pages/Disputes';
import { Risk } from './pages/Risk';
import { Placeholder } from './pages/Placeholder';
import { Login } from './pages/Login';
import { useAuth } from './lib/auth';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kyc" element={<KycReview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="*" element={<Placeholder title="Not found" phase="—" />} />
      </Routes>
    </Layout>
  );
}
