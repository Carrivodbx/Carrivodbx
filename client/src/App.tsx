import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import ScrollToTop from "@/components/scroll-to-top";
import { ChatBot } from "@/components/chatbot";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VehiclesPage from "@/pages/vehicles-page";
import VehicleDetailPage from "@/pages/vehicle-detail-page";
import AgencyDashboard from "@/pages/agency-dashboard";
import AgencySetup from "@/pages/agency-setup";
import ClientDashboard from "@/pages/client-dashboard";
import BookingPage from "@/pages/booking-page";
import PremiumSubscription from "@/pages/premium-subscription";
import InsurancePage from "@/pages/insurance-page";
import ConciergePage from "@/pages/concierge-page";
import HelpCenterPage from "@/pages/help-center-page";
import ContactPage from "@/pages/contact-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/vehicles/:id" component={VehicleDetailPage} />
      <ProtectedRoute path="/dashboard/agency/setup" component={AgencySetup} />
      <ProtectedRoute path="/dashboard/agency" component={AgencyDashboard} />
      <ProtectedRoute path="/dashboard/client" component={ClientDashboard} />
      <ProtectedRoute path="/booking/:vehicleId" component={BookingPage} />
      <ProtectedRoute path="/premium" component={PremiumSubscription} />
      <Route path="/insurance" component={InsurancePage} />
      <Route path="/concierge" component={ConciergePage} />
      <Route path="/help" component={HelpCenterPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <ScrollToTop />
            <Toaster />
            <Router />
            <ChatBot />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
