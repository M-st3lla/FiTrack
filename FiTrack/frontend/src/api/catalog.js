import { WORKOUTS } from "../data/workouts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function get(path) {
    const response = await fetch(`${API_BASE}${path}`);
    const body = await response.text();
    let data = null;
    if (body) {
        try {
            data = JSON.parse(body);
        } catch {
            if (response.ok) {
                throw new Error("The API returned an invalid JSON response.");
            }
        }
    }

    if (!response.ok) {
        if (typeof data?.error === "string") {
            throw new Error(data.error);
        }
        if (response.status === 502) {
            throw new Error(
                "The development proxy cannot reach the backend. Start the Flask server on port 5000.",
            );
        }
        throw new Error(
            `The API returned HTTP ${response.status}${body ? " with a non-JSON response" : " with an empty response"}.`,
        );
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The API returned an empty or invalid JSON response.");
    }
    return data;
}

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
    const { workouts } = await get("/workouts");
    return Promise.all(workouts.map(async (category) => {
        const { workout } = await get(`/workouts/${category.id}`);
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
    const { nutrition } = await get(`/nutrition?category_id=${encodeURIComponent(categoryId)}`);
    return nutrition;
}
