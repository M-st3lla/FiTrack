import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDarkMode}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle"
    >
      {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}
