import { createContext, useContext, useEffect, useState } from "react";
import { fetchWorkouts } from "../api/catalog";

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

// The catalogue comes from the API; the user's profile and sessions are local
// until the frontend has account sign-in wired up.
export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => load("fitrack_profile", null));
  const [sessions, setSessions] = useState(() => load("fitrack_sessions", []));
  const [workouts, setWorkouts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => save("fitrack_profile", profile), [profile]);
  useEffect(() => save("fitrack_sessions", sessions), [sessions]);

  useEffect(() => {
    let active = true;
    fetchWorkouts()
      .then((catalog) => {
        if (active) setWorkouts(catalog);
      })
      .catch((err) => {
        if (active) setCatalogError(err.message);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Returns an error string, or null on success.
  const addSessions = (newSessions) => {
    const occupiedSlots = new Set(sessions.map((session) => `${session.day}|${session.time}`));
    for (const session of newSessions) {
      const slot = `${session.day}|${session.time}`;
      if (occupiedSlots.has(slot)) {
        return `You already have a session on ${session.day} at ${session.time}.`;
      }
      occupiedSlots.add(slot);
    }
    const createdAt = Date.now();
    setSessions((prev) => [
      ...prev,
      ...newSessions.map((session, index) => ({
        ...session,
        id: `session-${createdAt}-${index}`,
        done: false,
      })),
    ]);
    return null;
  };
  const addSession = (session) => addSessions([session]);
  const toggleDone = (id) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const removeSession = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));
  const resetAll = () => {
    setProfile(null);
    setSessions([]);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        sessions,
        workouts,
        catalogLoading,
        catalogError,
        addSession,
        addSessions,
        toggleDone,
        removeSession,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);