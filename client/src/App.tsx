import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VehiclesPage from "@/pages/vehicles-page";
import VehicleDetailPage from "@/pages/vehicle-detail-page";
import AgencyDashboard from "@/pages/agency-dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import BookingPage from "@/pages/booking-page";
import PremiumSubscription from "@/pages/premium-subscription";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/vehicles/:id" component={VehicleDetailPage} />
      <ProtectedRoute path="/dashboard/agency" component={AgencyDashboard} />
      <ProtectedRoute path="/dashboard/client" component={ClientDashboard} />
      <ProtectedRoute path="/booking/:vehicleId" component={BookingPage} />
      <ProtectedRoute path="/premium" component={PremiumSubscription} />
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
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
