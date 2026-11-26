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
            <PageHeader title="Fuel the effort" subtitle="Simple, practical food guidance for the training you have planned." />

            <label className="mb-8 block max-w-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f86d29]">Nutrition plan</span>
                <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="fitness-field"
                >
                    {WORKOUTS.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </label>

            <div className="nutrition-summary">
                <span className="eyebrow">The focus</span>
                <p>{data.summary}</p>
            </div>

            <div className="grid gap-10 md:grid-cols-[1.4fr_.6fr]">
                <section className="nutrition-foods">
                    <h2 className="text-2xl font-black">Build your plate</h2>
                    <ul className="mt-4 border-t border-[#271C5E]/10">
                        {data.foods.map((f) => (
                            <li key={f.name} className="grid gap-1 border-b border-[#271C5E]/10 py-4 sm:grid-cols-[1fr_1fr]">
                                <p className="font-black"><span className="mr-3 text-[#f86d29]">↗</span>{f.name}</p>
                                <p className="text-sm text-[#271C5E]/55">{f.why}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="nutrition-tips">
                    <p className="eyebrow text-white/55">Keep in mind</p>
                    <h2 className="mt-2 text-3xl font-black">Quick tips</h2>
                    <ul className="mt-4 space-y-3 text-sm text-white/65">
                        {data.tips.map((t) => (
                            <li key={t} className="flex gap-2">
                                <span className="pattern-mark nutrition-tip-mark" aria-hidden="true" />
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