import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, ThemeToggle } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import CollectionPage from "@/pages/collection";
import MarketplacePage from "@/pages/marketplace";
import WalletPage from "@/pages/wallet";
import CompetitionsPage from "@/pages/competitions";
import PremierLeaguePage from "@/pages/premier-league";

function AuthenticatedRouter() {
  const { data: onboarding, isLoading } = useQuery<{
    completed: boolean;
  }>({
    queryKey: ["/api/onboarding/status"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  if (onboarding && !onboarding.completed) {
    return <OnboardingPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/competitions" component={CompetitionsPage} />
      <Route path="/premier-league" component={PremierLeaguePage} />
      <Route path="/collection" component={CollectionPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/wallet" component={WalletPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-md" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
