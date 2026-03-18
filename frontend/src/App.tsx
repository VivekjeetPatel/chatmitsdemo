import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaitingPage from "./pages/WaitingPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FilterManagement from "./pages/admin/FilterManagement";
import AdminActiveUsers from "./pages/admin/AdminActiveUsers";
import AdminSettings from "./pages/admin/AdminSettings";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: any) {
  return (
    <div style={{ padding: "20px", color: "red", fontFamily: "monospace" }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/waiting" element={<WaitingPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="filters" element={<FilterManagement />} />
            <Route path="users" element={<AdminActiveUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
