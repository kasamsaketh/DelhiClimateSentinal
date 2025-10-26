import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { AlertTicker } from "@/components/layout/AlertTicker";
import LandingPage from "@/pages/LandingPage";
import MapPage from "@/pages/MapPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/map" component={MapPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route component={NotFound} />
      </Switch>
      <AlertTicker />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Router />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
