import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProviders, useAuthContext } from "./providers.jsx";
import { AppShell } from "../components/layout/AppShell.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { TransactionsPage } from "../pages/TransactionsPage.jsx";
import { BudgetPage } from "../pages/BudgetPage.jsx";
import { HistoryPage } from "../pages/HistoryPage.jsx";
import { SettingsPage } from "../pages/SettingsPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";

function ProtectedRoute({ children }) {
  const { user, loading, settingsLoading } = useAuthContext();
  const location = useLocation();

  if (loading || settingsLoading) {
    return (
      <div className="app-loading">
        <LoadingState label={loading ? "Loading session..." : "Loading workspace settings..."} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.userSheetId && location.pathname !== "/settings") {
    return <Navigate to="/settings" replace />;
  }

  return children;
}

function RoutedApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppProviders>
        <RoutedApp />
      </AppProviders>
    </BrowserRouter>
  );
}
