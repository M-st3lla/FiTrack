
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["/", "Home"],
  ["/workouts", "Workouts"],
  ["/nutrition", "Nutrition"],
  ["/schedule", "Schedule"],
  ["/dashboard", "Dashboard"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

export default function Navbar({ isDarkMode, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const item = ({ isActive }) =>
    `block px-3 py-2 text-sm font-bold transition ${isActive
      ? "text-[#f86d29]"
      : "text-[#271C5E]/65 hover:text-[#f86d29]"
    }`;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#271C5E]/8 bg-[#f7f7fb]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-[#271C5E]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f86d29] text-sm text-[#271C5E]">
            F
          </span>
          <span>
            Fi<span className="text-[#f86d29]">Track</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="flex items-center gap-2">

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={item}
              >
                {label}
              </NavLink>
            ))}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Log out
              </button>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="rounded-md bg-[#f86d29] px-3 py-2 text-sm font-semibold text-[#271C5E] hover:bg-[#ff8c53]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Theme toggle */}
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggle={onToggleTheme}
          />

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-full border border-[#271C5E]/20 px-4 py-2 text-xs font-bold md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav className="border-t border-[#271C5E]/10 bg-[#f7f7fb] px-4 py-2 md:hidden">

          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={item}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-[#f86d29] px-3 py-2 text-center text-sm font-semibold text-[#271C5E]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
