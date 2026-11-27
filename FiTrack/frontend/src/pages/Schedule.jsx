
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import WorkoutImage from "../components/WorkoutImage";
import { useApp } from "../context/AppContext";
import { getWorkout, WORKOUTS } from "../data/workouts";
import { DAYS, sortSessions } from "../utils/plan";

export default function Schedule() {
    const {
        isAuthenticated,
        profile,
        sessions,
        workouts,
        catalogLoading,
        catalogError,
        accountLoading,
        accountError,
        addSessions,
        removeSession,
    } = useApp();

    const location = useLocation();
    const [params] = useSearchParams();

    const draft = location.state?.scheduleDraft;
    const requestedWorkout = params.get("workout");

    const initialWorkout = draft?.workoutId ?? (
        getWorkout(requestedWorkout)
            ? requestedWorkout
            : profile?.goal ?? ""
    );

    const [workoutId, setWorkoutId] = useState(initialWorkout);
    const [availableDays, setAvailableDays] = useState(
        draft?.availableDays ?? []
    );
    const [times, setTimes] = useState(draft?.times ?? {});
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [authRequired, setAuthRequired] = useState(false);

    const availableWorkouts = isAuthenticated ? workouts : WORKOUTS;
    const visibleSessions = isAuthenticated ? sessions : [];

    // Toggle available workout days
    const onToggleDay = (day) => {
        setAvailableDays((selected) =>
            selected.includes(day)
                ? selected.filter((item) => item !== day)
                : [...selected, day]
        );

        setTimes((current) => ({
            ...current,
            [day]: current[day] ?? "",
        }));

        setError("");
        setSaved(false);
        setAuthRequired(false);
    };

    // Update workout time
    const onTimeChange = (day, time) => {
        setTimes((current) => ({
            ...current,
            [day]: time,
        }));

        setError("");
        setSaved(false);
        setAuthRequired(false);
    };

    // Save weekly workout schedule
    const onSubmit = async (e) => {
        e.preventDefault();

        if (!workoutId) {
            setError("Please choose a workout.");
            return;
        }

        if (availableDays.length === 0) {
            setError("Select at least one day you are available to work out.");
            return;
        }

        const missingTime = availableDays.find((day) => !times[day]);

        if (missingTime) {
            setError(`Choose a workout time for ${missingTime}.`);
            return;
        }

        if (!isAuthenticated) {
            setError("");
            setAuthRequired(true);
            return;
        }

        setSaving(true);
        setError("");
        setAuthRequired(false);

        try {
            const err = await addSessions(
                availableDays.map((day) => ({
                    workoutId,
                    day,
                    time: times[day],
                }))
            );

            if (err) {
                setError(err);
                return;
            }

            setSaved(true);
            setAvailableDays([]);
            setTimes({});
        } catch (saveError) {
            setError(saveError.message || "Could not save your workout schedule.");
        } finally {
            setSaving(false);
        }
    };

    // Remove an existing session
    const onRemove = async (id) => {
        setError("");

        try {
            await removeSession(id);
        } catch (removeError) {
            setError(removeError.message);
        }
    };

    const inputCls = "schedule-input";

    const restDays = DAYS.filter(
        (day) => !availableDays.includes(day)
    );

    // Loading state
    if (isAuthenticated && accountLoading) {
        return (
            <p
                role="status"
                className="schedule-loading"
            >
                Loading your saved sessions…
            </p>
        );
    }

    const authState = {
        from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
        },
        scheduleDraft: {
            workoutId,
            availableDays,
            times,
        },
    };

    return (
        <div className="schedule-page">
            <PageHeader
                title="Schedule"
                subtitle="Explore workout schedules and plan when you want to train."
            />

            {!isAuthenticated && (
                <aside className="schedule-guest-note">
                    <span className="schedule-guest-mark" aria-hidden="true">01</span>
                    <p>
                        <strong>Planning as a guest?</strong> You can explore and
                        prepare a schedule here. Log in or create an account to save it.
                    </p>
                </aside>
            )}

            <div className="schedule-layout">

                {/* Workout scheduling form */}
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="schedule-form"
                >
                    <div className="schedule-form-heading">
                        <p className="eyebrow">Plan your week</p>
                        <h2>Make time to move.</h2>
                        <p>Choose your training days and set a start time for each session.</p>
                    </div>

                    {/* Workout selection */}
                    <label className="schedule-field">
                        <span className="schedule-field-label">
                            Workout
                        </span>

                        <select
                            name="workoutId"
                            value={workoutId}
                            onChange={(e) => {
                                setWorkoutId(e.target.value);
                                setError("");
                                setSaved(false);
                                setAuthRequired(false);
                            }}
                            className={inputCls}
                        >
                            <option value="">Select a workout</option>

                            {availableWorkouts.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name} · {w.duration} min
                                </option>
                            ))}
                        </select>
                    </label>

                    {catalogLoading && (
                        <p role="status" className="schedule-form-hint">
                            Loading workouts…
                        </p>
                    )}

                    {catalogError && (
                        <p role="alert" className="schedule-inline-error">
                            Could not load workouts: {catalogError}
                        </p>
                    )}

                    {accountError && (
                        <p role="alert" className="schedule-inline-error">
                            {accountError}
                        </p>
                    )}

                    {/* Available days */}
                    <fieldset className="schedule-fieldset">
                        <legend className="schedule-field-label">
                            Days you are free to work out
                        </legend>

                        <p className="schedule-form-hint">
                            Unselected days will be your rest days.
                        </p>

                        <div className="schedule-day-grid">
                            {DAYS.map((day) => {
                                const selected = availableDays.includes(day);

                                return (
                                    <label
                                        key={day}
                                        className={`schedule-day-choice${selected ? " is-selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => onToggleDay(day)}
                                            className="schedule-day-checkbox"
                                        />

                                        <span>{day}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* Workout times */}
                    {availableDays.length > 0 && (
                        <fieldset className="schedule-fieldset schedule-time-fields">
                            <legend className="schedule-field-label">
                                Workout time for each available day
                            </legend>

                            {DAYS.filter((day) =>
                                availableDays.includes(day)
                            ).map((day) => (
                                <label key={day} className="schedule-field">
                                    <span className="schedule-time-label">
                                        {day}
                                    </span>

                                    <input
                                        type="time"
                                        value={times[day] ?? ""}
                                        onChange={(e) =>
                                            onTimeChange(day, e.target.value)
                                        }
                                        className={inputCls}
                                        aria-label={`${day} workout time`}
                                    />
                                </label>
                            ))}
                        </fieldset>
                    )}

                    {/* Feedback */}
                    {error && (
                        <p role="alert" className="schedule-alert schedule-alert-error">
                            {error}
                        </p>
                    )}

                    {authRequired && (
                        <div role="alert" className="schedule-alert schedule-alert-auth">
                            <p>Log in or create an account to save your schedule.</p>
                            <div className="schedule-auth-links">
                                <Link
                                    to="/signup"
                                    state={authState}
                                    className="schedule-auth-link"
                                >
                                    Create account
                                </Link>
                                <Link
                                    to="/login"
                                    state={authState}
                                    className="schedule-auth-link"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    )}

                    {saved && (
                        <p className="schedule-alert schedule-alert-success">
                            Your weekly workout schedule is ready.
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving || catalogLoading || !availableWorkouts.length}
                        className="schedule-submit"
                    >
                        {saving
                            ? "Saving sessions…"
                            : "Build my weekly schedule"}
                    </button>

                    {/* Rest days */}
                    {availableDays.length > 0 && (
                        <p className="schedule-rest-note">
                            Rest days:{" "}
                            {restDays.length ? restDays.join(", ") : "None"}
                        </p>
                    )}
                </form>

                {/* Saved workout sessions */}
                <section className="schedule-sessions">
                    <div className="schedule-sessions-heading">
                        <div>
                            <p className="eyebrow">Your training log</p>
                            <h2>Your sessions</h2>
                        </div>
                        <span className="schedule-session-count">
                            {visibleSessions.length.toString().padStart(2, "0")}
                        </span>
                    </div>

                    {visibleSessions.length === 0 ? (
                        <p className="schedule-empty-state">
                            {isAuthenticated
                                ? "Your week is open. Build a schedule to add your first session."
                                : "Your saved sessions will appear here after you log in."}
                        </p>
                    ) : (
                        <ul className="schedule-session-list">
                            {sortSessions(visibleSessions).map((s) => {
                                const w =
                                    workouts.find(
                                        (item) => item.id === s.workoutId
                                    ) ?? getWorkout(s.workoutId);

                                return (
                                    <li
                                        key={s.id}
                                        className="schedule-session-card"
                                    >
                                        <div className="schedule-session-identity">
                                            <WorkoutImage
                                                workout={w}
                                                className="workout-mini-image"
                                            />

                                            <div className="schedule-session-copy">
                                                <p className="schedule-session-title">
                                                    {w?.name ?? "Workout"}
                                                </p>

                                                <p className="schedule-session-details">
                                                    {s.day}
                                                    {s.date ? `, ${s.date}` : ""} · {s.time} · {s.durationMin} min
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemove(s.id)}
                                            className="schedule-remove-button"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
