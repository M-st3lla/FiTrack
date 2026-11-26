
import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import WorkoutImage from "../components/WorkoutImage";
import { useApp } from "../context/AppContext";
import { getWorkout } from "../data/workouts";
import { DAYS, computePlan, sortSessions } from "../utils/plan";

function Stat({ label, value, sub }) {
    return (
        <div className="border-t-2 border-[#271C5E]/15 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#271C5E]/45">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black">{value}</p>

            {sub && (
                <p className="mt-1 text-xs text-[#271C5E]/45">
                    {sub}
                </p>
            )}
        </div>
    );
}

export default function Dashboard() {
    const {
        user,
        profile,
        sessions,
        workouts,
        accountLoading,
        accountError,
        toggleDone,
        removeSession,
        resetAll,
    } = useApp();

    const [actionError, setActionError] = useState("");

    const plan = computePlan(profile);
    const sorted = sortSessions(sessions);

    const burned = sessions
        .filter((s) => s.done)
        .reduce((sum, s) => {
            const workout =
                workouts.find((item) => item.id === s.workoutId) ??
                getWorkout(s.workoutId);

            return sum + (workout?.burn ?? 0);
        }, 0);

    const hasCalorieTarget = Number(profile?.caloriesToBurn) > 0;

    const pct = hasCalorieTarget
        ? Math.min(
            100,
            Math.round((burned / Number(profile.caloriesToBurn)) * 100)
        )
        : 0;

    const levelLabel = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Pro",
    }[profile?.fitnessLevel] || "Beginner";

    // Mark a session as completed or undo completion
    const onToggleDone = async (id) => {
        setActionError("");

        try {
            await toggleDone(id);
        } catch (error) {
            setActionError(error.message);
        }
    };

    // Remove a scheduled session
    const onRemove = async (id) => {
        setActionError("");

        try {
            await removeSession(id);
        } catch (error) {
            setActionError(error.message);
        }
    };

    // Reset the saved goal and sessions
    const onReset = async () => {
        setActionError("");

        try {
            await resetAll();
        } catch (error) {
            setActionError(error.message);
        }
    };

    // Handle users who are not logged in
    if (!user) {
        return (
            <div>
                <PageHeader
                    title="Dashboard"
                    subtitle="Your saved goals and sessions, loaded from your account."
                />

                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">
                        Log in or create an account to see your saved fitness data.
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

    // Handle dashboard loading
    if (accountLoading) {
        return (
            <p
                role="status"
                className="rounded-xl bg-white p-6 text-sm text-slate-500"
            >
                Loading your dashboard…
            </p>
        );
    }

    return (
        <div>
            {/* Dashboard heading */}
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-[#271C5E]/10 pb-7">
                <div>
                    <p className="eyebrow text-[#f86d29]">
                        Your training log
                    </p>

                    <h1 className="mt-2 text-5xl font-black tracking-[-.07em] md:text-7xl">
                        THE WORK<br className="sm:hidden" /> SO FAR.
                    </h1>
                </div>

                <p className="max-w-sm text-sm leading-6 text-[#271C5E]/55">
                    Every session is a vote for the person you want to become. Keep going.
                </p>
            </div>

            {/* Error messages */}
            {(accountError || actionError) && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                    {actionError || accountError}
                </p>
            )}

            {/* Goal information */}
            {!plan ? (
                <div className="border-y border-[#271C5E]/10 py-10 text-center">
                    <p className="text-[#271C5E]/55">
                        You haven't set a goal yet.
                    </p>

                    <Link
                        to="/"
                        className="mt-4 inline-block rounded-full bg-[#f86d29] px-6 py-3 font-black text-[#271C5E]"
                    >
                        Set your goal
                    </Link>
                </div>
            ) : (
                <>
                    {/* Statistics */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat
                            label="Goal"
                            value={plan.workout?.name ?? "Your goal"}
                            sub={
                                hasCalorieTarget
                                    ? `${profile.caloriesToBurn} kcal in ${profile.weeks} weeks`
                                    : `${levelLabel} · calorie target not set`
                            }
                        />

                        <Stat
                            label="Weekly target"
                            value={
                                plan.hasCalorieTarget
                                    ? `${plan.perWeek} kcal`
                                    : "Not set"
                            }
                            sub={
                                plan.hasCalorieTarget
                                    ? `≈ ${plan.sessionsPerWeek} sessions/week`
                                    : "Add a calorie target any time"
                            }
                        />

                        <Stat
                            label="BMI"
                            value={plan.bmi}
                            sub={plan.label}
                        />

                        <Stat
                            label="Sessions scheduled"
                            value={sessions.length}
                            sub={`${sessions.filter((s) => s.done).length} completed`}
                        />
                    </div>

                    {/* Progress tracking */}
                    <section className="dashboard-progress">
                        {plan.hasCalorieTarget ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">
                                        Progress to goal
                                    </span>

                                    <span className="text-white/60">
                                        {burned} / {profile.caloriesToBurn} kcal ({pct}%)
                                    </span>
                                </div>

                                <div className="dashboard-progress-track mt-3">
                                    <div style={{ width: `${pct}%` }} />
                                </div>

                                {sessions.length < plan.sessionsPerWeek && (
                                    <p className="mt-3 text-sm text-[#f86d29]">
                                        Your goal needs about {plan.sessionsPerWeek} sessions a week.{" "}

                                        <Link
                                            to={`/schedule?workout=${plan.workout.id}`}
                                            className="underline"
                                        >
                                            Schedule more
                                        </Link>
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm leading-6 text-white/75">
                                Calorie progress is hidden because you skipped a target.
                                Your scheduled sessions will still be tracked.
                            </p>
                        )}
                    </section>
                </>
            )}

            {/* Weekly schedule */}
            <section className="mt-6">
                <h2 className="mb-3 text-2xl font-black">
                    The weekly split
                </h2>

                <div className="grid gap-3 md:grid-cols-7">
                    {DAYS.map((day) => {
                        const items = sorted.filter((s) => s.day === day);

                        return (
                            <div
                                key={day}
                                className="border-t border-[#271C5E]/15 py-3"
                            >
                                <p className="text-sm font-semibold text-slate-700">
                                    <span className="md:hidden">{day}</span>

                                    <span className="hidden md:inline">
                                        {day.slice(0, 3)}
                                    </span>
                                </p>

                                {items.length === 0 ? (
                                    <p className="mt-2 text-xs text-slate-400">
                                        Rest
                                    </p>
                                ) : (
                                    items.map((s) => (
                                        <div
                                            key={s.id}
                                            className={`mt-2 px-2 py-2 text-xs ${s.done
                                                    ? "bg-[#4023CE]/10 text-[#4023CE] line-through"
                                                    : "bg-[#271C5E] text-white"
                                                }`}
                                        >
                                            <p className="font-semibold">{s.time}</p>

                                            <p>
                                                {(
                                                    workouts.find(
                                                        (item) => item.id === s.workoutId
                                                    ) ?? getWorkout(s.workoutId)
                                                )?.name ?? "Workout"}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Upcoming sessions */}
            <section className="mt-10 border-t border-[#271C5E]/10 pt-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">
                        Up next
                    </h2>

                    <Link
                        to="/schedule"
                        className="text-sm font-bold text-[#f86d29]"
                    >
                        + Add session
                    </Link>
                </div>

                {sorted.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                        No sessions yet.
                    </p>
                ) : (
                    <ul className="mt-3 divide-y divide-slate-100">
                        {sorted.map((s) => {
                            const w =
                                workouts.find((item) => item.id === s.workoutId) ??
                                getWorkout(s.workoutId);

                            return (
                                <li
                                    key={s.id}
                                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                                >
                                    <div>
                                        <p
                                            className={`font-medium ${s.done
                                                    ? "text-slate-400 line-through"
                                                    : ""
                                                }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <WorkoutImage
                                                    workout={w}
                                                    className="workout-mini-image"
                                                />

                                                {w?.name ?? "Workout"}
                                            </span>
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {s.day} · {s.time}
                                            {w?.burn ? ` · ~${w.burn} kcal` : ""}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 text-sm">
                                        <button
                                            onClick={() => onToggleDone(s.id)}
                                            className="text-emerald-700 hover:underline"
                                        >
                                            {s.done ? "Undo" : "Mark done"}
                                        </button>

                                        <button
                                            onClick={() => onRemove(s.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Reset functionality */}
            {(profile || sessions.length > 0) && (
                <button
                    onClick={() =>
                        window.confirm("Clear your goal and all sessions?") &&
                        onReset()
                    }
                    className="mt-6 text-sm text-slate-500 underline"
                >
                    Reset everything
                </button>
            )}
        </div>
    );
}
