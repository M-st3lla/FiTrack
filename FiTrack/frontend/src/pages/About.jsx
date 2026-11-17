import PageHeader from "../components/PageHeader";

const objectives = [
    "Select workout types according to fitness goals",
    "Get exercise recommendations for each workout",
    "Get food and general nutrition recommendations",
    "Schedule gym sessions on preferred days and times",
    "See an organised view of upcoming sessions",
    "Enter key information: age, weight, height and calories to burn",
    "Set a goal over a specific period and get a clear path to it",
];

export default function About() {
    return (
        <div>
            <PageHeader
                title="About FiTrack"
                subtitle="A Gym Workout and Nutrition Management System that organises workouts, nutrition and session schedules in one responsive platform."
            />

            <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-xl font-semibold">Why we built it</h2>
                    <p className="mt-2 text-slate-600">
                        Planning workouts, food and gym times usually means juggling notes, apps and screenshots.
                        FiTrack puts it all in one place, usable on a phone, tablet or desktop.
                    </p>
                    <h2 className="mt-6 text-xl font-semibold">Who it's for</h2>
                    <p className="mt-2 text-slate-600">
                        Gym beginners, regular gym users, and anyone who wants a more organised approach to fitness.
                    </p>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-xl font-semibold">What you can do</h2>
                    <ul className="mt-3 space-y-2">
                        {objectives.map((o) => (
                            <li key={o} className="flex gap-2 text-slate-600">
                                <span className="text-emerald-600">✓</span>
                                {o}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}