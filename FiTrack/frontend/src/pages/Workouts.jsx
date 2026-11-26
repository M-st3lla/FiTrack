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
        `border-b-2 px-3 py-3 text-sm font-bold ${active ? "border-[#4023CE] text-[#4023CE]" : "border-transparent text-[#271C5E]/45 hover:text-[#271C5E]"
        }`;

    return (
        <div>
            <PageHeader title="Find your pace" subtitle="Pick a lane, build a session, and make the next rep count." />

            <div className="mb-8 flex gap-1 overflow-x-auto border-b border-[#271C5E]/10">
                <button className={chip(filter === "all")} onClick={() => setFilter("all")}>
                    All
                </button>
                {WORKOUTS.map((w) => (
                    <button key={w.id} className={chip(filter === w.id)} onClick={() => setFilter(w.id)}>
                        {w.name}
                    </button>
                ))}
            </div>

            <div className="workout-list">
                {list.map((w, index) => (
                    <article key={w.id} className={`workout-row ${index % 2 ? "workout-row-alt" : ""}`}>
                        <div className="workout-row-index">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <b aria-hidden="true">{w.icon}</b>
                        </div>
                        <div className="workout-row-main">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{w.name}</h2>
                            {profile?.goal === w.id && (
                                <span className="rounded-full bg-[#f86d29] px-3 py-1 text-xs font-bold text-[#271C5E]">
                                    Your goal
                                </span>
                            )}
                        </div>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#271C5E]/55">{w.desc}</p>
                        <div className="workout-stats">
                            <span><b>{w.level}</b>LEVEL</span>
                            <span><b>{w.duration} min</b>TIME</span>
                            <span><b>{w.burn}</b>KCAL / SESSION</span>
                        </div>

                        <ul className="workout-exercises">
                            {w.exercises.map((ex) => (
                                <li key={ex.name}>
                                    <span>{ex.name}</span><small>{ex.detail}</small>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                to={`/schedule?workout=${w.id}`}
                                className="button-orange"
                            >
                                Build this session <span aria-hidden="true">↗</span>
                            </Link>
                            <Link
                                to={`/nutrition?goal=${w.id}`}
                                className="rounded-full border border-[#271C5E]/20 px-5 py-3 text-center text-xs font-black hover:border-[#f86d29]"
                            >
                                Fuel guide
                            </Link>
                        </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}