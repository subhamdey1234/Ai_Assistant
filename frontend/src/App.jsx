import React, { useContext, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ContextProvider, Context } from "./context/Context";

// Lazy load components
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Home = React.lazy(() => import("./pages/Home"));
const Customize = React.lazy(() => import("./pages/Customize"));
const Customize2 = React.lazy(() => import("./pages/Customize2"));

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// AppRoutes - simple explicit routing using Context inside the provider
function AppRoutes() {
  const { userdata } = useContext(Context);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={userdata ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={userdata ? <Navigate to="/login" replace /> : <Signup />} />

        {/* Protected Routes (explicit ternaries) */}
        <Route path="/" element={userdata ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/home" element={userdata ? <Home /> : <Navigate to="/login" replace />} />
  <Route path="/customize" element={userdata ? <Customize /> : <Navigate to="/login" replace />} />
        <Route path="/customize2" element={userdata ? <Customize2 /> : <Navigate to="/login" replace />} />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold text-sky-500">404</h1>
              <p className="text-xl text-gray-600">Page not found</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppRoutes />;
}
