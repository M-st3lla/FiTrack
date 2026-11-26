
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";

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
      <Link to="/" className="mt-4 inline-block font-bold text-[#f86d29] underline">
        Back home
      </Link>
    </div>
  );
}

function AppLayout({ isDarkMode, onToggleTheme }) {
  const location = useLocation();

  const isAuthPage = ["/login", "/signup", "/register"].includes(
    location.pathname
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb] text-[#271C5E]">
      {!isAuthPage && (
        <Navbar isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      )}
      {isAuthPage && (
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Main application */}
          <Route path="/about" element={<About />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/schedule" element={<Schedule />} />
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
      window.localStorage.setItem("fitrack-theme", isDarkMode ? "dark" : "light");
    } catch {
      // The selected theme remains active for this page even if storage is unavailable.
    }
  }, [isDarkMode]);

  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((current) => !current)}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
