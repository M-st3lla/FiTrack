import { Link } from "react-router-dom";
import GoalForm from "../components/GoalForm";

const quick = [
    ["/workouts", "🏋️", "Workouts", "Pick a workout type and see the exercises."],
    ["/nutrition", "🥗", "Nutrition", "Food guidance matched to your goal."],
    ["/schedule", "📅", "Schedule", "Choose the day and time for each session."],
    ["/dashboard", "📊", "Dashboard", "See your plan, timetable and progress."],
];

export default function Home() {
    return (
        <div>
            <section className="grid items-center gap-8 md:grid-cols-2">
                <div>
                    <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                        Plan your workouts. <span className="text-emerald-600">Fuel them right.</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        FiTrack brings workouts, nutrition and gym scheduling into one simple, mobile-friendly place.
                        Enter your details, set a goal and get a clear weekly path to reach it.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/workouts" className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                            Browse workouts
                        </Link>
                        <Link to="/schedule" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100">
                            Schedule a session
                        </Link>
                    </div>
                </div>
                <GoalForm />
            </section>

            <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quick.map(([to, icon, title, text]) => (
                    <Link
                        key={to}
                        to={to}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow"
                    >
                        <div className="text-3xl">{icon}</div>
                        <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{text}</p>
                    </Link>
                ))}
            </section>
        </div>
    );
}