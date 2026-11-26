import { WORKOUTS } from "../data/workouts";
import { apiRequest } from "./client";

function formatExercise(exercise) {
    const prescription = [
        exercise.sets && `${exercise.sets} sets`,
        exercise.reps && `${exercise.reps} reps`,
        exercise.duration_min && `${exercise.duration_min} min`,
    ].filter(Boolean).join(" × ");
    return {
        name: exercise.name,
        detail: [exercise.description, prescription].filter(Boolean).join(" · "),
    };
}

export async function fetchWorkouts() {
    const { workouts } = await apiRequest("/workouts");
    return Promise.all(workouts.map(async (category) => {
        const { workout } = await apiRequest(`/workouts/${category.id}`);
        const presentation = WORKOUTS.find(
            (item) => item.name.toLowerCase() === category.name.toLowerCase(),
        );
        const id = presentation?.id
            ?? category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return {
            id,
            backendId: category.id,
            name: category.name,
            desc: workout.description,
            icon: presentation?.icon ?? "🏋️",
            level: presentation?.level,
            duration: presentation?.duration,
            burn: presentation?.burn,
            exercises: workout.exercises.map(formatExercise),
        };
    }));
}

export async function fetchNutrition(categoryId) {
    const { nutrition } = await apiRequest(
        `/nutrition?category_id=${encodeURIComponent(categoryId)}`,
    );
    return nutrition;
}
