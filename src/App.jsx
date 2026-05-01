import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Insights from './pages/dashboard/Insights';
import Pay from './pages/dashboard/Pay';
import Cards from './pages/dashboard/Cards.jsx';
import Profile from './pages/dashboard/Profile';
import Transactions from './pages/dashboard/Transactions';
import Support from './pages/dashboard/Support';
import Recipients from './pages/dashboard/Recipients';
import ErrorBoundaryPage from './components/ErrorBoundaryPage';

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
        <Route index element={<ErrorBoundaryPage><Dashboard /></ErrorBoundaryPage>} />
        <Route path="insights" element={<ErrorBoundaryPage><Insights /></ErrorBoundaryPage>} />
        <Route path="pay" element={<ErrorBoundaryPage><Pay /></ErrorBoundaryPage>} />
        <Route path="cards" element={<ErrorBoundaryPage><Cards /></ErrorBoundaryPage>} />
        <Route path="transactions" element={<ErrorBoundaryPage><Transactions /></ErrorBoundaryPage>} />
        <Route path="support" element={<ErrorBoundaryPage><Support /></ErrorBoundaryPage>} />
        <Route path="profile" element={<ErrorBoundaryPage><Profile /></ErrorBoundaryPage>} />
        <Route path="recipients" element={<ErrorBoundaryPage><Recipients /></ErrorBoundaryPage>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const PRIVY_CONFIG = {
  appId: "cmoalm0b300vx0djsqojffdy7",
  config: {
    // Embedded wallets only — Base chain (USDC)
    embeddedWallets: {
      createOnLogin: "all-users",
      noPromptOnSignature: true,
    },
    defaultChain: {
      id: 8453,
      name: "Base",
      network: "base",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
    },
    supportedChains: [
      {
        id: 8453,
        name: "Base",
        network: "base",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
      },
    ],
    // Base44 handles auth; Privy is used only for embedded wallets
    loginMethods: ["email"],
    appearance: { theme: "dark" },
  },
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PrivyProvider appId={PRIVY_CONFIG.appId} config={PRIVY_CONFIG.config}>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </PrivyProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App