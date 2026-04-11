import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "./context/AuthContext";
import { useUI } from "./context/UIContext";
import { useLoader } from "./context/LoaderContext";

import { setLoader } from "./api/axios";

import Bot from "./Component/Bot";
import Profile from "./Component/Profile";
import Login from "./Component/Login";
import Register from "./Component/Register";
import Dashboard from "./Component/Dashboard";
import AdminDashboard from "./Component/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Toast from "./Component/Toast";
import ConfirmModal from "./Component/ConfirmModal";
import Loader from "./Component/Loader";

function App() {
  const { user, loading } = useAuth();
  const { toast, confirm, setToast, setConfirm } = useUI();
  const { startLoading, stopLoading } = useLoader();

  const location = useLocation();

  // 🔥 CONNECT AXIOS
  useEffect(() => {
    setLoader(startLoading, stopLoading);
  }, []);

  // ❌ prevent flash
  if (loading) return null;

  return (
    <>
      {/* ✅ HIDE LOADER ON LOGIN/REGISTER */}
      {!["/login", "/register"].includes(location.pathname) && <Loader />}

      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/chat" /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/chat" /> : <Register />}
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Bot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onConfirm={async () => {
            await confirm.onConfirm();
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

export default App;