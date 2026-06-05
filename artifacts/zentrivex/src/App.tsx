import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard/index";
import PlansPage from "@/pages/dashboard/plans";
import DepositPage from "@/pages/dashboard/deposit";
import WithdrawPage from "@/pages/dashboard/withdraw";
import InvestmentsPage from "@/pages/dashboard/investments";
import KycPage from "@/pages/dashboard/kyc";
import TransactionsPage from "@/pages/dashboard/transactions";
import AdminDashboard from "@/pages/admin/index";
import AdminDeposits from "@/pages/admin/deposits";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminKyc from "@/pages/admin/kyc";
import AdminPlans from "@/pages/admin/plans";
import AdminUsers from "@/pages/admin/users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/plans" component={PlansPage} />
      <Route path="/dashboard/deposit" component={DepositPage} />
      <Route path="/dashboard/withdraw" component={WithdrawPage} />
      <Route path="/dashboard/investments" component={InvestmentsPage} />
      <Route path="/dashboard/kyc" component={KycPage} />
      <Route path="/dashboard/transactions" component={TransactionsPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/deposits" component={AdminDeposits} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      <Route path="/admin/kyc" component={AdminKyc} />
      <Route path="/admin/plans" component={AdminPlans} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
