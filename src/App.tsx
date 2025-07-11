
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WorkoutPage from "./pages/WorkoutPage";
import ProteinPage from "./pages/ProteinPage";
import StepsPage from "./pages/StepsPage";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";
import PWAInstall from "./components/PWAInstall";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background flex flex-col">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/workout/:workoutId" element={<WorkoutPage />} />
              <Route path="/protein" element={<ProteinPage />} />
              <Route path="/steps" element={<StepsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Navigation />
            <PWAInstall />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
