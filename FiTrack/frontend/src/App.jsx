
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AppProvider, useApp } from "./context/AppContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ThemeToggle from "./components/ThemeToggle";

import Home from "./pages/Home";
import About from "./pages/About";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Schedule from "./pages/Schedule";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link
        to="/"
        className="mt-4 inline-block font-bold text-[#f86d29] underline"
      >
        Back home
      </Link>
    </div>
  );
}

function getReturnPath(location) {
  const from = location.state?.from;
  if (!from || typeof from.pathname !== "string" || !from.pathname.startsWith("/")) {
    return "/dashboard";
  }
  return `${from.pathname}${from.search || ""}${from.hash || ""}`;
}

function RequireLogin({ children }) {
  const { isAuthenticated, accountLoading } = useApp();
  const location = useLocation();

  if (accountLoading) {
    return <p role="status" className="p-8 text-center">Checking your account…</p>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function LoginPage() {
  const { login } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    await login(formData);
    navigate(getReturnPath(location), { replace: true });
  };

  return <Login onLogin={handleLogin} authState={location.state} />;
}

function SignupPage() {
  const { signup } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    await signup(formData);
    navigate(getReturnPath(location), { replace: true });
  };

  return <Signup onSignup={handleSignup} authState={location.state} />;
}

function AppLayout({ isDarkMode, onToggleTheme }) {
  const location = useLocation();

  const isAuthPage = ["/login", "/signup", "/register"].includes(
    location.pathname
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb] text-[#271C5E]">
      {!isAuthPage && (
        <Navbar
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
      )}

      {isAuthPage && (
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggle={onToggleTheme}
          />
        </div>
      )}

      <div
        className={
          isAuthPage
            ? "flex-1"
            : "mx-auto w-full max-w-[1480px] flex-1 px-5 py-8 sm:px-8 lg:px-12"
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Main application */}
          <Route path="/about" element={<About />} />
          <Route path="/workouts" element={<RequireLogin><Workouts /></RequireLogin>} />
          <Route path="/nutrition" element={<RequireLogin><Nutrition /></RequireLogin>} />
          <Route path="/schedule" element={<RequireLogin><Schedule /></RequireLogin>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem("fitrack-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";

    try {
      window.localStorage.setItem(
        "fitrack-theme",
        isDarkMode ? "dark" : "light"
      );
    } catch {
      // Theme remains active even if storage is unavailable.
    }
  }, [isDarkMode]);

  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout
          isDarkMode={isDarkMode}
          onToggleTheme={() =>
            setIsDarkMode((current) => !current)
          }
        />
      </BrowserRouter>
    </AppProvider>
  );
}
