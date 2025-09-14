import React, { useContext, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ContextProvider, Context } from './context/Context';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Home = React.lazy(() => import('./pages/Home'));
const Customize = React.lazy(() => import('./pages/Customize'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { userdata } = useContext(Context);
  const location = useLocation();

  // if (requireAuth && !userdata) {
  //   // Redirect to login but save the attempted url
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // if (!requireAuth && userdata) {
  //   // If user is logged in, redirect away from auth pages
  //   return <Navigate to="/customize" replace />;
  // }

  return children;
};

export default function App() {
  return (
    <ContextProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute requireAuth={true}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customize"
            element={
              <ProtectedRoute requireAuth={true}>
                <Customize />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - 404 */}
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
    </ContextProvider>
  );
}
