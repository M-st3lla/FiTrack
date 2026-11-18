import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
};

// Holds the user's profile/goal and scheduled sessions (saved in localStorage
// until the Python backend is connected).
export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => load("fitrack_profile", null));
  const [sessions, setSessions] = useState(() => load("fitrack_sessions", []));

  useEffect(() => save("fitrack_profile", profile), [profile]);
  useEffect(() => save("fitrack_sessions", sessions), [sessions]);

  // Returns an error string, or null on success.
  const addSession = ({ workoutId, day, time }) => {
    if (sessions.some((s) => s.day === day && s.time === time)) {
      return `You already have a session on ${day} at ${time}.`;
    }
    setSessions((prev) => [...prev, { id: Date.now(), workoutId, day, time, done: false }]);
    return null;
  };
  const toggleDone = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const removeSession = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));
  const resetAll = () => {
    setProfile(null);
    setSessions([]);
  };

  return (
    <AppContext.Provider
      value={{ profile, setProfile, sessions, addSession, toggleDone, removeSession, resetAll }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);