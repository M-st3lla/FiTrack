import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AppProvider, useApp } from "./context/AppContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
      <Link to="/" className="mt-4 inline-block text-emerald-600 underline">
        Back home
      </Link>
    </div>
  );
}

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    await login(formData);
    navigate("/dashboard");
  };

  return <Login onLogin={handleLogin} />;
}

function SignupPage() {
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    await register(formData);
    navigate("/dashboard");
  };

  return <Signup onSignup={handleSignup} />;
}

function AppLayout() {
  const location = useLocation();

  const isAuthPage = ["/login", "/signup", "/register"].includes(
    location.pathname
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {!isAuthPage && <Navbar />}

      <div
        className={
          isAuthPage
            ? "flex-1"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"
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
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
