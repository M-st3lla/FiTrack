import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

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
  const item = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
    }`;

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

        <nav className="hidden gap-1 md:flex">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={item}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-slate-200 px-4 py-2 md:hidden">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={item} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}