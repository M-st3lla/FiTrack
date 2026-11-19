import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useApp } from "../context/AppContext";
import { getWorkout } from "../data/workouts";
import { DAYS, computePlan, sortSessions } from "../utils/plan";

function Stat({ label, value, sub }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function Dashboard() {
    const { profile, sessions, toggleDone, removeSession, resetAll } = useApp();
    const plan = computePlan(profile);
    const sorted = sortSessions(sessions);

    const burned = sessions.filter((s) => s.done).reduce((sum, s) => sum + getWorkout(s.workoutId).burn, 0);
    const pct = profile ? Math.min(100, Math.round((burned / profile.caloriesToBurn) * 100)) : 0;

    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Your goal, weekly path and scheduled sessions at a glance." />

            {!plan ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-slate-600">You haven't set a goal yet.</p>
                    <Link to="/" className="mt-3 inline-block rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white">
                        Set your goal
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat label="Goal" value={plan.workout.name} sub={`${profile.caloriesToBurn} kcal in ${profile.weeks} weeks`} />
                        <Stat label="Weekly target" value={`${plan.perWeek} kcal`} sub={`≈ ${plan.sessionsPerWeek} sessions/week`} />
                        <Stat label="BMI" value={plan.bmi} sub={plan.label} />
                        <Stat label="Sessions scheduled" value={sessions.length} sub={`${sessions.filter((s) => s.done).length} completed`} />
                    </div>

                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Progress to goal</span>
                            <span className="text-slate-500">
                                {burned} / {profile.caloriesToBurn} kcal ({pct}%)
                            </span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        {sessions.length < plan.sessionsPerWeek && (
                            <p className="mt-3 text-sm text-amber-700">
                                Your goal needs about {plan.sessionsPerWeek} sessions a week.{" "}
                                <Link to={`/schedule?workout=${plan.workout.id}`} className="underline">
                                    Schedule more
                                </Link>
                            </p>
                        )}
                    </section>
                </>
            )}

            <section className="mt-6">
                <h2 className="mb-3 text-lg font-semibold">Weekly timetable</h2>
                <div className="grid gap-3 md:grid-cols-7">
                    {DAYS.map((day) => {
                        const items = sorted.filter((s) => s.day === day);
                        return (
                            <div key={day} className="rounded-xl border border-slate-200 bg-white p-3">
                                <p className="text-sm font-semibold text-slate-700">
                                    <span className="md:hidden">{day}</span>
                                    <span className="hidden md:inline">{day.slice(0, 3)}</span>
                                </p>
                                {items.length === 0 ? (
                                    <p className="mt-2 text-xs text-slate-400">Rest</p>
                                ) : (
                                    items.map((s) => (
                                        <div
                                            key={s.id}
                                            className={`mt-2 rounded-lg px-2 py-1.5 text-xs ${s.done ? "bg-emerald-100 text-emerald-800 line-through" : "bg-slate-100"
                                                }`}
                                        >
                                            <p className="font-semibold">{s.time}</p>
                                            <p>{getWorkout(s.workoutId).name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Upcoming sessions</h2>
                    <Link to="/schedule" className="text-sm text-emerald-700 underline">
                        + Add session
                    </Link>
                </div>
                {sorted.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No sessions yet.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-slate-100">
                        {sorted.map((s) => {
                            const w = getWorkout(s.workoutId);
                            return (
                                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                    <div>
                                        <p className={`font-medium ${s.done ? "text-slate-400 line-through" : ""}`}>
                                            {w.icon} {w.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {s.day} · {s.time} · ~{w.burn} kcal
                                        </p>
                                    </div>
                                    <div className="flex gap-3 text-sm">
                                        <button onClick={() => toggleDone(s.id)} className="text-emerald-700 hover:underline">
                                            {s.done ? "Undo" : "Mark done"}
                                        </button>
                                        <button onClick={() => removeSession(s.id)} className="text-red-600 hover:underline">
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {(profile || sessions.length > 0) && (
                <button
                    onClick={() => window.confirm("Clear your goal and all sessions?") && resetAll()}
                    className="mt-6 text-sm text-slate-500 underline"
                >
                    Reset everything
                </button>
            )}
        </div>
    );
}