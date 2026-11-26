
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
        workoutId: getWorkout(params.get("workout"))
            ? params.get("workout")
            : "",
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

        } catch (err) {
            setError(err.message || "Unable to schedule session. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "fitness-field";

    return (
        <div>
            <PageHeader
                title="Make it happen"
                subtitle="Put your next workout on the calendar. Show up for the time you set aside."
            />

            <div className="schedule-layout">

                {/* Schedule form */}
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="schedule-form space-y-5"
                >
                    <p className="eyebrow text-white/60">
                        Plan a session
                    </p>

                    <h2 className="mb-6 text-3xl font-black text-white">
                        When are you<br />showing up?
                    </h2>

                    <label className="block">
                        <span className="text-sm font-bold text-white/80">
                            Workout
                        </span>

                        <select
                            name="workoutId"
                            value={form.workoutId}
                            onChange={onChange}
                            className={inputCls}
                        >
                            <option value="">Select a workout</option>

                            {WORKOUTS.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold text-white/80">
                            Day
                        </span>

                        <select
                            name="day"
                            value={form.day}
                            onChange={onChange}
                            className={inputCls}
                        >
                            <option value="">Select a day</option>

                            {DAYS.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-bold text-white/80">
                            Time
                        </span>

                        <input
                            type="time"
                            name="time"
                            value={form.time}
                            onChange={onChange}
                            className={inputCls}
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {saved && (
                        <p className="text-sm font-bold text-[#f86d29]">
                            Session scheduled ✓
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-[#f86d29] px-4 py-3.5 font-black text-[#271C5E] hover:bg-[#ff8c53] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Adding..." : (
                            <>
                                Add my session{" "}
                                <span aria-hidden="true">↗</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Scheduled sessions */}
                <section className="schedule-sessions">
                    <p className="eyebrow text-[#f86d29]">
                        The week ahead
                    </p>

                    <h2 className="mb-6 mt-2 text-3xl font-black">
                        Your sessions
                    </h2>

                    {sessions.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                            Nothing scheduled yet.
                        </p>
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100">
                            {sortSessions(sessions).map((s) => {
                                const w = getWorkout(s.workoutId);

                                return (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-3 border-b border-[#271C5E]/10 py-5"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {w.icon} {w.name}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {s.day} · {s.time}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeSession(s.id)}
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
