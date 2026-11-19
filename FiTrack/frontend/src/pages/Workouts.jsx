import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useApp } from "../context/AppContext";
import { WORKOUTS } from "../data/workouts";

export default function Workouts() {
    const { profile } = useApp();
    const [filter, setFilter] = useState("all");
    const list = filter === "all" ? WORKOUTS : WORKOUTS.filter((w) => w.id === filter);

    const chip = (active) =>
        `rounded-full border px-4 py-1.5 text-sm font-medium ${active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white hover:bg-slate-100"
        }`;

    return (
        <div>
            <PageHeader title="Workouts" subtitle="Choose a workout category to see its recommended exercises." />

            <div className="mb-6 flex flex-wrap gap-2">
                <button className={chip(filter === "all")} onClick={() => setFilter("all")}>
                    All
                </button>
                {WORKOUTS.map((w) => (
                    <button key={w.id} className={chip(filter === w.id)} onClick={() => setFilter(w.id)}>
                        {w.name}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {list.map((w) => (
                    <article key={w.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-xl font-bold text-slate-900">
                                {w.icon} {w.name}
                            </h2>
                            {profile?.goal === w.id && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                    Your goal
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{w.desc}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                            <span className="rounded bg-slate-100 px-2 py-1">{w.level}</span>
                            <span className="rounded bg-slate-100 px-2 py-1">{w.duration} min</span>
                            <span className="rounded bg-slate-100 px-2 py-1">~{w.burn} kcal</span>
                        </div>

                        <ul className="mt-4 flex-1 divide-y divide-slate-100">
                            {w.exercises.map((ex) => (
                                <li key={ex.name} className="flex justify-between gap-3 py-2 text-sm">
                                    <span className="font-medium">{ex.name}</span>
                                    <span className="text-right text-slate-500">{ex.detail}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex gap-2">
                            <Link
                                to={`/schedule?workout=${w.id}`}
                                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                Schedule this
                            </Link>
                            <Link
                                to={`/nutrition?goal=${w.id}`}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold hover:bg-slate-100"
                            >
                                Nutrition
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}