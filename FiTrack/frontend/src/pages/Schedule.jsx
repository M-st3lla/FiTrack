
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import WorkoutImage from "../components/WorkoutImage";
import { useApp } from "../context/AppContext";
import { getWorkout } from "../data/workouts";
import { DAYS, sortSessions } from "../utils/plan";

export default function Schedule() {
    const {
        user,
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

    const [params] = useSearchParams();

    const requestedWorkout = params.get("workout");

    const initialWorkout = getWorkout(requestedWorkout)
        ? requestedWorkout
        : profile?.goal ?? "";

    const [workoutId, setWorkoutId] = useState(initialWorkout);
    const [availableDays, setAvailableDays] = useState([]);
    const [times, setTimes] = useState({});
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

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
    };

    // Update workout time
    const onTimeChange = (day, time) => {
        setTimes((current) => ({
            ...current,
            [day]: time,
        }));

        setError("");
        setSaved(false);
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

        setSaving(true);
        setError("");

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

    const inputCls =
        "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

    const restDays = DAYS.filter(
        (day) => !availableDays.includes(day)
    );

    // Require authentication
    if (!user) {
        return (
            <div>
                <PageHeader
                    title="Schedule"
                    subtitle="Save your workout days and times to your account."
                />

                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">
                        Log in or create an account to save and retrieve your sessions.
                    </p>

                    <div className="mt-4 flex justify-center gap-3">
                        <Link
                            to="/signup"
                            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
                        >
                            Create account
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (accountLoading) {
        return (
            <p
                role="status"
                className="rounded-xl bg-white p-6 text-sm text-slate-500"
            >
                Loading your saved sessions…
            </p>
        );
    }

    return (
        <div>
            <PageHeader
                title="Schedule"
                subtitle="Choose when you are free and FiTrack will build your weekly workout schedule."
            />

            <div className="grid gap-6 md:grid-cols-2">

                {/* Workout scheduling form */}
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
                >
                    {/* Workout selection */}
                    <label className="block">
                        <span className="text-sm font-medium">
                            Workout
                        </span>

                        <select
                            name="workoutId"
                            value={workoutId}
                            onChange={(e) => {
                                setWorkoutId(e.target.value);
                                setError("");
                                setSaved(false);
                            }}
                            className={inputCls}
                        >
                            <option value="">Select a workout</option>

                            {workouts.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {catalogLoading && (
                        <p role="status" className="text-xs text-slate-500">
                            Loading workouts…
                        </p>
                    )}

                    {catalogError && (
                        <p role="alert" className="text-xs text-red-600">
                            Could not load workouts: {catalogError}
                        </p>
                    )}

                    {accountError && (
                        <p role="alert" className="text-xs text-red-600">
                            {accountError}
                        </p>
                    )}

                    {/* Available days */}
                    <fieldset>
                        <legend className="text-sm font-medium">
                            Days you are free to work out
                        </legend>

                        <p className="mt-1 text-xs text-slate-500">
                            Unselected days will be your rest days.
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {DAYS.map((day) => {
                                const selected = availableDays.includes(day);

                                return (
                                    <label
                                        key={day}
                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selected
                                                ? "border-emerald-500 bg-emerald-50"
                                                : "border-slate-200"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => onToggleDay(day)}
                                            className="accent-emerald-600"
                                        />

                                        <span>{day}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* Workout times */}
                    {availableDays.length > 0 && (
                        <fieldset className="space-y-3">
                            <legend className="text-sm font-medium">
                                Workout time for each available day
                            </legend>

                            {DAYS.filter((day) =>
                                availableDays.includes(day)
                            ).map((day) => (
                                <label key={day} className="block">
                                    <span className="text-sm text-slate-600">
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
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {saved && (
                        <p className="text-sm text-emerald-700">
                            Your weekly workout schedule is ready ✓
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving || catalogLoading || !workouts.length}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {saving
                            ? "Saving sessions…"
                            : "Build my weekly schedule"}
                    </button>

                    {/* Rest days */}
                    {availableDays.length > 0 && (
                        <p className="text-xs text-slate-500">
                            Rest days:{" "}
                            {restDays.length ? restDays.join(", ") : "None"}
                        </p>
                    )}
                </form>

                {/* Saved workout sessions */}
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">
                        Your sessions
                    </h2>

                    {sessions.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                            Nothing scheduled yet.
                        </p>
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100">
                            {sortSessions(sessions).map((s) => {
                                const w =
                                    workouts.find(
                                        (item) => item.id === s.workoutId
                                    ) ?? getWorkout(s.workoutId);

                                return (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-3 border-b border-[#271C5E]/10 py-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <WorkoutImage
                                                workout={w}
                                                className="workout-mini-image"
                                            />

                                            <div>
                                                <p className="font-medium">
                                                    {w?.name ?? "Workout"}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {s.day}
                                                    {s.date ? `, ${s.date}` : ""} · {s.time}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemove(s.id)}
                                            className="text-sm text-red-600 hover:underline"
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
