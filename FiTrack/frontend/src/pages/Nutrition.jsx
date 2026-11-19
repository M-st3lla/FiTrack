import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useApp } from "../context/AppContext";
import { WORKOUTS } from "../data/workouts";
import { NUTRITION } from "../data/nutrition";

export default function Nutrition() {
    const { profile } = useApp();
    const [params] = useSearchParams();
    const initial = params.get("goal") || profile?.goal || "weight-loss";
    const [goal, setGoal] = useState(NUTRITION[initial] ? initial : "weight-loss");
    const data = NUTRITION[goal];

    return (
        <div>
            <PageHeader title="Nutrition" subtitle="General food guidance matched to your workout goal." />

            <label className="mb-6 block max-w-xs">
                <span className="text-sm font-medium text-slate-700">Show nutrition for</span>
                <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                    {WORKOUTS.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </label>

            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">{data.summary}</div>

            <div className="grid gap-6 md:grid-cols-3">
                <section className="rounded-xl border border-slate-200 bg-white p-6 md:col-span-2">
                    <h2 className="text-lg font-semibold">Recommended foods</h2>
                    <ul className="mt-3 divide-y divide-slate-100">
                        {data.foods.map((f) => (
                            <li key={f.name} className="py-3">
                                <p className="font-medium">{f.name}</p>
                                <p className="text-sm text-slate-500">{f.why}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">Quick tips</h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {data.tips.map((t) => (
                            <li key={t} className="flex gap-2">
                                <span className="text-emerald-600">•</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <p className="mt-6 text-xs text-slate-500">
                General guidance only, not medical advice. See a nutritionist for a personalised plan.
            </p>
        </div>
    );
}