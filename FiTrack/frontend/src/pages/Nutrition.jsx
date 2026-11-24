import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useApp } from "../context/AppContext";
import { fetchNutrition } from "../api/catalog";

export default function Nutrition() {
    const { profile, workouts, catalogLoading, catalogError } = useApp();
    const [params] = useSearchParams();
    const initial = params.get("goal") || profile?.goal || "weight-loss";
    const [workoutId, setWorkoutId] = useState(initial);
    const [nutritionState, setNutritionState] = useState(null);
    const workout = workouts.find((item) => item.id === workoutId) ?? workouts[0];

    useEffect(() => {
        if (!workout) return undefined;
        let active = true;
        fetchNutrition(workout.backendId)
            .then((data) => {
                if (active) {
                    setNutritionState({
                        categoryId: workout.backendId,
                        recommendations: data,
                        error: "",
                    });
                }
            })
            .catch((err) => {
                if (active) {
                    setNutritionState({
                        categoryId: workout.backendId,
                        recommendations: [],
                        error: err.message,
                    });
                }
            });
        return () => {
            active = false;
        };
    }, [workout]);

    const currentNutrition = nutritionState?.categoryId === workout?.backendId
        ? nutritionState
        : null;
    const recommendations = currentNutrition?.recommendations ?? [];
    const loading = Boolean(workout) && !currentNutrition;
    const error = currentNutrition?.error ?? "";

    const foods = recommendations.flatMap((tip) =>
        tip.foods.map((name, index) => ({
            key: `${tip.id}-${index}`,
            name,
            recommendation: tip.title,
        })),
    );

    return (
        <div>
            <PageHeader title="Nutrition" subtitle="General food guidance matched to your workout goal." />

            <label className="mb-6 block max-w-xs">
                <span className="text-sm font-medium text-slate-700">Show nutrition for</span>
                <select
                    value={workout?.id ?? ""}
                    onChange={(e) => setWorkoutId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                    {workouts.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </label>

            {catalogLoading && <p role="status" className="mb-4 text-sm text-slate-500">Loading workout categories…</p>}
            {catalogError && <p role="alert" className="mb-4 text-sm text-red-600">Could not load workout categories: {catalogError}</p>}
            {loading && <p role="status" className="mb-4 text-sm text-slate-500">Loading nutrition recommendations…</p>}
            {error && <p role="alert" className="mb-4 text-sm text-red-600">Could not load nutrition recommendations: {error}</p>}
            {!catalogLoading && !catalogError && !workout && (
                <p className="text-sm text-slate-500">No workout categories are available.</p>
            )}
            {workout && recommendations.length === 0 && !loading && !error && !catalogError && (
                <p className="mb-4 text-sm text-slate-500">No nutrition recommendations are available for this workout.</p>
            )}

            {recommendations.length > 0 && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                    Nutrition guidance for {workout.name}, loaded from FiTrack.
                </div>
            )}

            {recommendations.length > 0 && <div className="grid gap-6 md:grid-cols-3">
                <section className="rounded-xl border border-slate-200 bg-white p-6 md:col-span-2">
                    <h2 className="text-lg font-semibold">Recommended foods</h2>
                    <ul className="mt-3 divide-y divide-slate-100">
                        {foods.map((food) => (
                            <li key={food.key} className="py-3">
                                <p className="font-medium">{food.name}</p>
                                <p className="text-sm text-slate-500">{food.recommendation}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">Quick tips</h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {recommendations.map((tip) => (
                            <li key={tip.id} className="flex gap-2">
                                <span className="text-emerald-600">•</span>
                                <span><strong>{tip.title}:</strong> {tip.description}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>}

            <p className="mt-6 text-xs text-slate-500">
                General guidance only, not medical advice. See a nutritionist for a personalised plan.
            </p>
        </div>
    );
}