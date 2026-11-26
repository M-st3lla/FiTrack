import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { WORKOUTS } from "../data/workouts";
import { DAYS } from "../utils/plan";

const AppContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const GOAL_LABEL_TO_SLUG = {
  "build strength": "strength",
  "lose weight": "weight-loss",
  "weight loss": "weight-loss",
  "build muscle": "muscle-building",
  "muscle building": "muscle-building",
  "improve cardio": "cardio",
  "cardio": "cardio",
  "general fitness": "general-fitness",
};

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
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
};

function nextDateForDay(dayName) {
  const targetIdx = DAYS.indexOf(dayName);
  const today = new Date();
  const currentIdx = (today.getDay() + 6) % 7;
  const diff = (targetIdx - currentIdx + 7) % 7;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return target.toISOString().slice(0, 10);
}

function dayNameFromDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return DAYS[(dt.getDay() + 6) % 7];
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load("fitrack_user", null));
  const [token, setToken] = useState(() => load("fitrack_token", null));
  const [profile, setProfileState] = useState(() => load("fitrack_profile", null));
  const [sessions, setSessions] = useState(() => load("fitrack_sessions", []));
  const [categories, setCategories] = useState([]);

  useEffect(() => save("fitrack_user", user), [user]);
  useEffect(() => save("fitrack_token", token), [token]);
  useEffect(() => save("fitrack_profile", profile), [profile]);
  useEffect(() => save("fitrack_sessions", sessions), [sessions]);

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}${path}`, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.message || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.errors = data.errors;
        throw err;
      }
      return data;
    },
    [token]
  );

  useEffect(() => {
    apiFetch("/api/workouts")
      .then((data) => setCategories(data.workouts || []))
      .catch(() => {
        /* fallback when offline */
      });
  }, [apiFetch]);

  const slugToCategoryId = useCallback(
    (slug) => {
      const local = WORKOUTS.find((w) => w.id === slug);
      if (!local) return null;
      const match = categories.find(
        (c) => c.name.toLowerCase() === local.name.toLowerCase()
      );
      return match ? match.id : null;
    },
    [categories]
  );

  const categoryNameToSlug = useCallback((name) => {
    const match = WORKOUTS.find((w) => w.name.toLowerCase() === String(name).toLowerCase());
    return match ? match.id : "general-fitness";
  }, []);

  const mapBackendSession = useCallback(
    (s) => ({
      id: s.id,
      workoutId: categoryNameToSlug(s.workout),
      day: dayNameFromDate(s.session_date),
      time: s.start_time,
      done: s.status === "completed",
      session_date: s.session_date,
      duration_min: s.duration_min,
      notes: s.notes,
      status: s.status,
    }),
    [categoryNameToSlug]
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const [profRes, sessRes] = await Promise.all([
          apiFetch("/api/profile"),
          apiFetch("/api/sessions"),
        ]);
        if (cancelled) return;

        if (profRes.profile && profRes.profile.weight_kg) {
          setProfileState((prev) => ({
            ...prev,
            age: profRes.profile.age,
            weight: profRes.profile.weight_kg,
            height: profRes.profile.height_cm,
            caloriesToBurn: profRes.profile.calories_to_burn,
            fitnessLevel: profRes.profile.fitness_level,
            goal: prev?.goal || "weight-loss",
            weeks: prev?.weeks || 4,
          }));
        }
        setSessions((sessRes.sessions || []).map(mapBackendSession));
      } catch (err) {
        if (!cancelled && err.status === 401) {
          setToken(null);
          setUser(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, apiFetch, mapBackendSession]);

  const login = async (emailOrPayload, maybePassword) => {
    const payload =
      typeof emailOrPayload === "object" && emailOrPayload !== null
        ? { email: emailOrPayload.email, password: emailOrPayload.password }
        : { email: emailOrPayload, password: maybePassword };

    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const register = async (nameOrPayload, maybeEmail, maybePassword) => {
    const raw =
      typeof nameOrPayload === "object" && nameOrPayload !== null
        ? nameOrPayload
        : { name: nameOrPayload, email: maybeEmail, password: maybePassword };

    const name = (raw.name ?? raw.fullName ?? "").trim();
    const email = (raw.email ?? "").trim();
    const password = raw.password ?? "";

    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (raw.goal) {
      const mappedGoal = GOAL_LABEL_TO_SLUG[String(raw.goal).toLowerCase()] || "general-fitness";
      setProfileState((prev) => ({ ...(prev || {}), goal: mappedGoal, weeks: prev?.weeks || 4 }));
    }

    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfileState(null);
    setSessions([]);
  };

  const setProfile = async (nextProfile) => {
    setProfileState(nextProfile);
    if (!token || !nextProfile) return;

    await apiFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        age: Number(nextProfile.age),
        weight_kg: Number(nextProfile.weight),
        height_cm: Number(nextProfile.height),
        calories_to_burn: Math.min(10000, Number(nextProfile.caloriesToBurn)),
        fitness_level: nextProfile.fitnessLevel || "beginner",
      }),
    });
  };

  const addSession = async ({ workoutId, day, time }) => {
    if (sessions.some((s) => s.day === day && s.time === time)) {
      return `You already have a session on ${day} at ${time}.`;
    }

    if (!token) {
      setSessions((prev) => [...prev, { id: Date.now(), workoutId, day, time, done: false }]);
      return null;
    }

    const category_id = slugToCategoryId(workoutId);
    if (!category_id) {
      return "Workout category not found on the server.";
    }

    const localWorkout = WORKOUTS.find((w) => w.id === workoutId);
    try {
      const data = await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          category_id,
          session_date: nextDateForDay(day),
          start_time: time,
          duration_min: localWorkout?.duration || 45,
        }),
      });
      setSessions((prev) => [...prev, mapBackendSession(data.session)]);
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const toggleDone = async (id) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    const nextDone = !target.done;

    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: nextDone } : s)));
    if (!token) return;

    try {
      await apiFetch(`/api/sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextDone ? "completed" : "scheduled" }),
      });
    } catch {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: !nextDone } : s)));
    }
  };

  const removeSession = async (id) => {
    const previous = sessions;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (!token) return;

    try {
      await apiFetch(`/api/sessions/${id}`, { method: "DELETE" });
    } catch {
      setSessions(previous);
    }
  };

  const resetAll = () => {
    setProfileState(null);
    setSessions([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        profile,
        setProfile,
        sessions,
        addSession,
        toggleDone,
        removeSession,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
