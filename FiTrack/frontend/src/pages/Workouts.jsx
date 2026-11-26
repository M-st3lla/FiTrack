import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import WorkoutImage from "../components/WorkoutImage";
import { useApp } from "../context/AppContext";
import {
    getTrainingLevelLabel,
    TRAINING_LEVELS,
    WORKOUTS,
} from "../data/workouts";

export default function Workouts() {
    const { profile } = useApp();
    const [filter, setFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const list = WORKOUTS.filter((workout) => (
        (filter === "all" || workout.id === filter) &&
        (levelFilter === "all" || workout.level === levelFilter)
    ));

    return (
        <main className="workouts-page">
            <PageHeader
                title="Find your pace"
                subtitle="Choose a workout that fits your experience, then build your next session."
            />

            <section className="workout-filters" aria-label="Filter workouts">
                <div>
                    <p className="eyebrow mb-2">Workout type</p>
                    <div className="workout-type-filters" role="group" aria-label="Workout type">
                        <button
                            type="button"
                            aria-pressed={filter === "all"}
                            className={`workout-filter-chip ${filter === "all" ? "is-active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All workouts
                        </button>
                        {WORKOUTS.map((workout) => (
                            <button
                                key={workout.id}
                                type="button"
                                aria-pressed={filter === workout.id}
                                className={`workout-filter-chip ${filter === workout.id ? "is-active" : ""}`}
                                onClick={() => setFilter(workout.id)}
                            >
                                {workout.name}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="workout-level-filter">
                    <span className="eyebrow">Training level</span>
                    <select
                        value={levelFilter}
                        onChange={(event) => setLevelFilter(event.target.value)}
                        className="fitness-field"
                    >
                        <option value="all">Every level</option>
                        {TRAINING_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            {list.length ? (
                <section className="workout-grid" aria-label="Available workouts">
                    {list.map((workout, index) => (
                        <article key={workout.id} className="workout-card">
                            <div className="workout-card-visual">
                                <WorkoutImage workout={workout} className="workout-card-image" />
                                <span className="workout-card-index">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="workout-level-badge">
                                    {getTrainingLevelLabel(workout.level)}
                                </span>
                            </div>

                            <div className="workout-card-content">
                                <div className="workout-card-heading">
                                    <div>
                                        <p className="eyebrow">Training plan</p>
                                        <h2>{workout.name}</h2>
                                    </div>
                                    {profile?.goal === workout.id && (
                                        <span className="workout-goal-badge">Your goal</span>
                                    )}
                                </div>

                                <p className="workout-card-description">{workout.desc}</p>

                                <div className="workout-stats">
                                    <span><b>{workout.duration} min</b>Duration</span>
                                    <span><b>{workout.burn} kcal</b>Per session</span>
                                    <span><b>{getTrainingLevelLabel(workout.level)}</b>Level</span>
                                </div>

                                <details className="workout-exercise-details">
                                    <summary>
                                        <span>Exercise breakdown</span>
                                        <span>{workout.exercises.length} movements</span>
                                    </summary>
                                    <ul className="workout-exercises">
                                        {workout.exercises.map((exercise) => (
                                            <li key={exercise.name}>
                                                <span>{exercise.name}</span>
                                                <small>{exercise.detail}</small>
                                            </li>
                                        ))}
                                    </ul>
                                </details>

                                <div className="workout-card-actions">
                                    <Link to={`/schedule?workout=${workout.id}`} className="button-orange">
                                        Build this session <span aria-hidden="true">↗</span>
                                    </Link>
                                    <Link
                                        to={`/nutrition?goal=${workout.id}`}
                                        className="workout-secondary-link"
                                    >
                                        Fuel guide
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <p className="workout-empty" role="status">
                    No workouts match those filters. Choose a different type or training level.
                </p>
            )}
        </main>
    );
}
