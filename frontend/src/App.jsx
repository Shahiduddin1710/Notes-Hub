import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { authRoutes } from "./auth/auth.routes";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import AccessNotes from "./pages/AccessNotes";
import ContactUs from "./pages/ContactUs";
import Subjects from "./pages/Subjects";
import Files from "./pages/Files";
import Navbar from "./components/Navbar"; 
import PageWrapper from "./components/PageWrapper";
import ScrollToTop from "./components/ScrollToTop";
import Disclaimer from "./pages/Disclaimer";
import TermsModal from "./components/TermsModal";

const DotsLoader = () => (
  <div className="dots-loader-wrap">
    <div className="dots-loader">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, user, updateUser, logout } = useAuth();

  const showTerms = isAuthenticated && !!user && !user.termsAccepted;

 const navigate = useNavigate();

const handleAcceptTerms = () => {
    updateUser((prev) => ({ ...prev, termsAccepted: true }));
    navigate("/dashboard", { replace: true });
  };
 const handleDeclineTerms = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      <ScrollToTop />
      <Navbar />
      {showTerms && (
        <TermsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
          <Route path="/disclaimer" element={<ProtectedRoute><PageWrapper><Disclaimer /></PageWrapper></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><PageWrapper><ContactUs /></PageWrapper></ProtectedRoute>} />

          {/* Public routes - no auth required */}
          <Route path="/access-notes" element={<PageWrapper><AccessNotes /></PageWrapper>} />
          <Route path="/subjects/:university/:semester" element={<PageWrapper><Subjects /></PageWrapper>} />
          <Route path="/notes/:university/:semester/:subject" element={<PageWrapper><Files /></PageWrapper>} />
          <Route path="/notes/:university/:semester/:subject/:subSubject" element={<PageWrapper><Files /></PageWrapper>} />

          {/* Auth routes (login, signup, etc.) */}
          {authRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

        </Routes>
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<DotsLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}