
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiRequest } from "../api/client";
import { fetchWorkouts } from "../api/catalog";
import { DAYS } from "../utils/plan";

const AppContext = createContext(null);

const TOKEN_KEY = "fitrack_token";
const USER_KEY = "fitrack_user";

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function nextDateForDay(day, time = "00:00") {
  const dayIndex = DAYS.indexOf(day);

  if (dayIndex < 0) {
    throw new Error(`Unknown workout day: ${day}.`);
  }

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;

  let offset = (dayIndex - todayIndex + 7) % 7;

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  if (offset === 0 && time <= currentTime) {
    offset = 7;
  }

  const sessionDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offset,
  );

  return [
    sessionDate.getFullYear(),
    String(sessionDate.getMonth() + 1).padStart(2, "0"),
    String(sessionDate.getDate()).padStart(2, "0"),
  ].join("-");
}

function profileFromApi(profile, workouts) {
  if (
    !profile ||
    !Object.keys(profile).some((key) => key !== "bmi")
  ) {
    return null;
  }

  const workout = workouts.find(
    (item) => item.backendId === profile.goal_category_id,
  );

  return {
    age: profile.age ?? "",
    weight: profile.weight_kg ?? "",
    height: profile.height_cm ?? "",
    caloriesToBurn: profile.calories_to_burn ?? "",
    fitnessLevel: profile.fitness_level ?? "",
    weeks: profile.goal_weeks ?? "",
    goal: workout?.id ?? "",
  };
}

function sessionFromApi(session, workouts) {
  const sessionDate = new Date(`${session.session_date}T12:00:00`);

  const day = DAYS[(sessionDate.getDay() + 6) % 7];

  const workout = workouts.find(
    (item) => item.backendId === session.category_id,
  );

  return {
    id: session.id,
    workoutId: workout?.id ?? String(session.category_id),
    day,
    date: session.session_date,
    time: session.start_time.slice(0, 5),
    done: session.status === "completed",
    durationMin: session.duration_min,
    notes: session.notes,
  };
}

async function fetchAccountData(workouts) {
  const [profileResponse, sessionsResponse] = await Promise.all([
    apiRequest("/profile"),
    apiRequest("/sessions"),
  ]);

  let migrationError = "";

  try {
    await migrateLegacyData(
      profileResponse.profile,
      sessionsResponse.sessions,
      workouts,
    );
  } catch (error) {
    migrationError = error.message;
  }

  const [latestProfile, latestSessions] = await Promise.all([
    apiRequest("/profile"),
    apiRequest("/sessions"),
  ]);

  return {
    profile: profileFromApi(latestProfile.profile, workouts),
    sessions: latestSessions.sessions.map((session) =>
      sessionFromApi(session, workouts),
    ),
    migrationError,
  };
}

async function migrateLegacyData(profile, sessions, workouts) {
  const legacyProfile = readStorage("fitrack_profile", null);
  const legacySessions = readStorage("fitrack_sessions", []);

  const hasLegacyData =
    legacyProfile ||
    (Array.isArray(legacySessions) && legacySessions.length);

  if (!hasLegacyData) return;

  const migrationErrors = [];

  const profileHasData = [
    "age",
    "weight_kg",
    "height_cm",
    "calories_to_burn",
    "fitness_level",
    "goal_weeks",
  ].some(
    (key) =>
      profile?.[key] !== null &&
      profile?.[key] !== undefined,
  );

  if (legacyProfile && !profileHasData) {
    const payload = {};

    for (const [source, target] of [
      ["age", "age"],
      ["weight", "weight_kg"],
      ["height", "height_cm"],
      ["caloriesToBurn", "calories_to_burn"],
      ["fitnessLevel", "fitness_level"],
      ["weeks", "goal_weeks"],
    ]) {
      if (
        legacyProfile[source] !== undefined &&
        legacyProfile[source] !== ""
      ) {
        payload[target] =
          target === "fitness_level"
            ? legacyProfile[source]
            : Number(legacyProfile[source]);
      }
    }

    const workout = workouts.find(
      (item) => item.id === legacyProfile.goal,
    );

    if (workout) {
      payload.goal_category_id = workout.backendId;
    }

    if (Object.keys(payload).length) {
      try {
        await apiRequest("/profile", {
          method: "PUT",
          body: payload,
        });
      } catch (error) {
        migrationErrors.push(
          `Saved profile could not be imported: ${error.message}`,
        );
      }
    }
  }

  if (Array.isArray(legacySessions)) {
    const existing = new Set(
      sessions.map(
        (session) =>
          `${session.category_id}|${session.session_date}|${session.start_time.slice(0, 5)}`,
      ),
    );

    for (const legacy of legacySessions) {
      try {
        const workout = workouts.find(
          (item) => item.id === legacy.workoutId,
        );

        if (!workout) {
          throw new Error("unknown workout category");
        }

        const date = nextDateForDay(legacy.day, legacy.time);

        const key = `${workout.backendId}|${date}|${legacy.time}`;

        if (existing.has(key)) continue;

        const { session } = await apiRequest("/sessions", {
          method: "POST",
          body: {
            category_id: workout.backendId,
            session_date: date,
            start_time: legacy.time,
            duration_min: 60,
          },
        });

        if (legacy.done) {
          await apiRequest(`/sessions/${session.id}`, {
            method: "PUT",
            body: {
              status: "completed",
            },
          });
        }

        existing.add(key);
      } catch (error) {
        migrationErrors.push(
          `${legacy.day} session could not be imported: ${error.message}`,
        );
      }
    }
  }

  if (migrationErrors.length) {
    throw new Error(migrationErrors.join(" "));
  }

  localStorage.removeItem("fitrack_profile");
  localStorage.removeItem("fitrack_sessions");
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] = useState(() =>
    readStorage(USER_KEY, null),
  );

  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const [catalogLoading, setCatalogLoading] = useState(Boolean(token));
  const [catalogError, setCatalogError] = useState("");

  const [accountLoading, setAccountLoading] = useState(Boolean(token));
  const [accountError, setAccountError] = useState("");

  const pendingLoads = useRef(new Map());

  // Fetch workout catalog from backend.
  useEffect(() => {
    let active = true;

    if (!token) return undefined;

    fetchWorkouts()
      .then((catalog) => {
        if (active) {
          setWorkouts(catalog);
        }
      })
      .catch((error) => {
        if (active) {
          setCatalogError(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setCatalogLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  // Clear authentication and account information.
  const clearAuthentication = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    setProfile(null);
    setSessions([]);
    setWorkouts([]);

    setCatalogError("");
    setCatalogLoading(false);
    setAccountLoading(false);
    setAccountError("");
  }, []);

  // Load profile and sessions after the workout catalog is ready.
  useEffect(() => {
    if (!token) return undefined;
    if (catalogLoading) return undefined;

    let active = true;

    let load = pendingLoads.current.get(token);

    if (!load) {
      load = fetchAccountData(workouts);
      pendingLoads.current.set(token, load);
    }

    load
      .then((data) => {
        if (!active) return;

        setProfile(data.profile);
        setSessions(data.sessions);
        setAccountError(data.migrationError);
      })
      .catch((error) => {
        if (!active) return;

        if (error.status === 401) {
          clearAuthentication();
        } else {
          setAccountError(error.message);
        }
      })
      .finally(() => {
        if (pendingLoads.current.get(token) === load) {
          pendingLoads.current.delete(token);
        }

        if (active) {
          setAccountLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, catalogLoading, workouts, clearAuthentication]);

  // Save authentication details after login or signup.
  const persistAuthentication = (result) => {
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));

    setToken(result.token);
    setUser(result.user);
    setWorkouts([]);

    setCatalogError("");
    setCatalogLoading(true);

    setAccountLoading(true);
    setAccountError("");
  };

  const login = async ({ email, password }) => {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
      auth: false,
    });

    persistAuthentication(result);
  };

  const signup = async ({ fullName, email, password, goal }) => {
    const result = await apiRequest("/auth/register", {
      method: "POST",
      body: {
        name: fullName,
        email,
        password,
        goal_category: goal,
      },
      auth: false,
    });

    persistAuthentication(result);
  };

  // Save the user's fitness profile.
  const saveProfile = async (value) => {
    const workout = workouts.find(
      (item) => item.id === value.goal,
    );

    if (!workout) {
      throw new Error("Choose a workout loaded from the backend.");
    }

    const caloriesToBurn =
      value.caloriesToBurn === "" ||
        value.caloriesToBurn === null ||
        value.caloriesToBurn === undefined
        ? null
        : Number(value.caloriesToBurn);

    const response = await apiRequest("/profile", {
      method: "PUT",
      body: {
        age: Number(value.age),
        weight_kg: Number(value.weight),
        height_cm: Number(value.height),
        calories_to_burn: caloriesToBurn,
        fitness_level: value.fitnessLevel || null,
        goal_category_id: workout.backendId,
        goal_weeks: Number(value.weeks),
      },
    });

    setProfile(
      profileFromApi(response.profile, workouts),
    );

    setAccountError("");
  };

  // Add workout sessions.
  const addSessions = async (newSessions) => {
    try {
      for (const item of newSessions) {
        const workout = workouts.find(
          (entry) => entry.id === item.workoutId,
        );

        if (!workout) {
          throw new Error("Choose a workout loaded from the backend.");
        }

        const date = nextDateForDay(item.day, item.time);

        const response = await apiRequest("/sessions", {
          method: "POST",
          body: {
            category_id: workout.backendId,
            session_date: date,
            start_time: item.time,
            duration_min: 60,
          },
        });

        setSessions((current) => [
          ...current,
          sessionFromApi(response.session, workouts),
        ]);
      }

      setAccountError("");

      return null;
    } catch (error) {
      return error.message;
    }
  };

  // Mark a workout session as completed or scheduled.
  const toggleDone = async (id) => {
    const session = sessions.find(
      (item) => item.id === id,
    );

    if (!session) {
      throw new Error("Session not found.");
    }

    const status = session.done
      ? "scheduled"
      : "completed";

    await apiRequest(`/sessions/${id}`, {
      method: "PUT",
      body: {
        status,
      },
    });

    setSessions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, done: !item.done }
          : item,
      ),
    );

    setAccountError("");
  };

  // Remove a workout session.
  const removeSession = async (id) => {
    await apiRequest(`/sessions/${id}`, {
      method: "DELETE",
    });

    setSessions((current) =>
      current.filter((item) => item.id !== id),
    );

    setAccountError("");
  };

  // Reset the user's dashboard.
  const resetAll = async () => {
    await apiRequest("/dashboard", {
      method: "DELETE",
    });

    setProfile(null);
    setSessions([]);
    setAccountError("");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(token && user),

        login,
        signup,
        logout: clearAuthentication,

        profile,
        saveProfile,

        sessions,
        workouts,

        catalogLoading,
        catalogError,

        accountLoading,
        accountError,

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
