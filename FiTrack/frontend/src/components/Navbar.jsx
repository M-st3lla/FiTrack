import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
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
  const item = ({ isActive }) =>
    `block px-3 py-2 text-sm font-bold transition ${
      isActive ? "text-[#f86d29]" : "text-[#271C5E]/65 hover:text-[#f86d29]"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[#271C5E]/8 bg-[#f7f7fb]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-[#271C5E]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f86d29] text-sm text-[#271C5E]">F</span>
          <span>Fi<span className="text-[#f86d29]">Track</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden gap-1 md:flex">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={item}>
                {label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
          <button
            className="rounded-full border border-[#271C5E]/20 px-4 py-2 text-xs font-bold md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#271C5E]/10 bg-[#f7f7fb] px-4 py-2 md:hidden">
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