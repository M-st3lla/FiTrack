import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useApp } from "../context/AppContext";
import { WORKOUTS, getWorkout } from "../data/workouts";
import { DAYS, sortSessions } from "../utils/plan";

export default function Schedule() {
    const { sessions, addSession, removeSession } = useApp();
    const [params] = useSearchParams();
    const [form, setForm] = useState({
        workoutId: getWorkout(params.get("workout")) ? params.get("workout") : "",
        day: "",
        time: "",
    });
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSaved(false);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.workoutId || !form.day || !form.time) {
            setError("Please choose a workout, a day and a time.");
            return;
        }
        setSubmitting(true);
        try {
            const err = await addSession(form);
            if (err) {
                setError(err);
                return;
            }
            setSaved(true);
            setForm({ ...form, day: "", time: "" });
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

    return (
        <div>
            <PageHeader title="Schedule" subtitle="Pick a workout, a day and a time for your gym session." />

            <div className="grid gap-6 md:grid-cols-2">
                <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <label className="block">
                        <span className="text-sm font-medium">Workout</span>
                        <select name="workoutId" value={form.workoutId} onChange={onChange} className={inputCls}>
                            <option value="">Select a workout</option>
                            {WORKOUTS.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Day</span>
                        <select name="day" value={form.day} onChange={onChange} className={inputCls}>
                            <option value="">Select a day</option>
                            {DAYS.map((d) => (
                                <option key={d}>{d}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Time</span>
                        <input type="time" name="time" value={form.time} onChange={onChange} className={inputCls} />
                    </label>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {saved && <p className="text-sm text-emerald-700">Session scheduled</p>}

                    <button
                        disabled={submitting}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {submitting ? "Adding..." : "Add to schedule"}
                    </button>
                </form>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">Your sessions</h2>
                    {sessions.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">Nothing scheduled yet.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100">
                            {sortSessions(sessions).map((s) => {
                                const w = getWorkout(s.workoutId);
                                return (
                                    <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="font-medium">
                                                {w.icon} {w.name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {s.day} · {s.time}
                                            </p>
                                        </div>
                                        <button onClick={() => removeSession(s.id)} className="text-sm text-red-600 hover:underline">
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
