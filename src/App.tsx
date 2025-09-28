import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ✅ Use correct paths
import HospitalDashboard from "./components/HospitalDashboard";
// import Reports from "./components/Report";
import LabManagement from "./components/dashboard/LabManagement";
import LabReport from "./components/dashboard/LabReport";
import LabSummaryReport from "./components/dashboard/LabSummaryReport";
import Reports from "@/components/Report"; 


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Index />} />

          {/* Hospital Dashboard */}
          <Route path="/dashboard" element={<HospitalDashboard />} />
          <Route path="/reports" element={<Reports />} />

          {/* Sub-pages */}
          <Route path="/dashboard/LabManagement" element={<LabManagement />} />
          <Route path="/dashboard/LabReport" element={<LabReport />} />
          <Route path="/dashboard/LabSummaryReport" element={<LabSummaryReport />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
