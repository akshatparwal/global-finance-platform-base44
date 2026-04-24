import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Insights from './pages/dashboard/Insights';
import Pay from './pages/dashboard/Pay';
import Cards from './pages/dashboard/Cards';
import Profile from './pages/dashboard/Profile';
import Transactions from './pages/dashboard/Transactions';
import Support from './pages/dashboard/Support';

// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/HowItWorks" element={<HowItWorks />} />
        {/* Add your page Route elements here */}
      </Route>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="insights" element={<Insights />} />
        <Route path="pay" element={<Pay />} />
        <Route path="cards" element={<Cards />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<Profile />} />

      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App