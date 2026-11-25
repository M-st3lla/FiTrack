import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const links = [
  ["/", "Home"],
  ["/workouts", "Workouts"],
  ["/nutrition", "Nutrition"],
  ["/schedule", "Schedule"],
  ["/dashboard", "Dashboard"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const item = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
    }`;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold text-emerald-600">
          Fi<span className="text-slate-800">Track</span>
        </Link>

        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={item}>
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
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-slate-200 px-4 py-2 md:hidden">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={item} onClick={() => setOpen(false)}>
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
                  className="rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white"
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
