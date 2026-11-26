import { getWorkout } from "../data/workouts";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function bmiInfo(weight, height) {
    const bmi = weight / Math.pow(height / 100, 2);
    let label = "Healthy";
    if (bmi < 18.5) label = "Underweight";
    else if (bmi >= 30) label = "Obese";
    else if (bmi >= 25) label = "Overweight";
    return { bmi: Math.round(bmi * 10) / 10, label };
}

// Turns the user's goal + period into a simple weekly path.
export function computePlan(profile) {
    if (
        !profile
        || !profile.goal
        || !profile.caloriesToBurn
        || !profile.weeks
        || !profile.weight
        || !profile.height
    ) return null;
    const workout = getWorkout(profile.goal);
    if (!workout) return null;
    const perWeek = Math.round(profile.caloriesToBurn / profile.weeks);
    const sessionsPerWeek = Math.min(7, Math.max(1, Math.ceil(perWeek / workout.burn)));
    return {
        workout,
        perWeek,
        sessionsPerWeek,
        ...bmiInfo(profile.weight, profile.height),
    };
}

export const sortSessions = (list) =>
    [...list].sort((a, b) => {
        if (a.date && b.date) return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        return DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time);
    });