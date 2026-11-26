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
        <main className="about-page">
            <section className="about-hero">
                <p className="eyebrow text-white/60">Built for real life</p>
                <h1>FITNESS<br />WITHOUT<br /><span>THE FUSS.</span></h1>
                <p>FiTrack brings your training, nutrition and schedule into one simple, supportive space.</p>
                <span className="about-spark" aria-hidden="true" />
            </section>
            <section className="about-story">
                <div>
                    <p className="eyebrow text-[#f86d29]">Why FiTrack</p>
                    <h2>Less planning.<br />More <span>doing.</span></h2>
                </div>
                <div className="about-story-copy">
                    <p>Planning workouts, food and gym times usually means juggling notes, apps and screenshots. FiTrack pulls the pieces together so you can focus on the next step—not managing another system.</p>
                    <p>Whether you are walking into a gym for the first time or finding your rhythm again, start where you are and build from there.</p>
                </div>
            </section>
            <section className="about-capabilities">
                <div className="about-capabilities-title">
                    <p className="eyebrow">One place to</p>
                    <h2>MOVE<br />FORWARD.</h2>
                </div>
                <ul>
                    {objectives.map((objective, index) => (
                        <li key={objective}><span>{String(index + 1).padStart(2, "0")}</span>{objective}<b aria-hidden="true">↗</b></li>
                    ))}
                </ul>
            </section>
        </main>
    );
}