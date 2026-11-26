import { Link } from "react-router-dom";
import GoalForm from "../components/GoalForm";

const pathways = [
    ["/workouts", "01", "Train", "Find your next session"],
    ["/nutrition", "02", "Fuel", "Eat for the work"],
    ["/schedule", "03", "Show up", "Make time for you"],
    ["/dashboard", "04", "Progress", "See every small win"],
];

export default function Home() {
    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="home-hero-photo" aria-hidden="true" />
                <div className="home-hero-copy">
                    <p className="eyebrow text-white/75">A better routine starts here</p>
                    <h1 className="home-title">MOVE<br />WITH<br /><span>PURPOSE.</span></h1>
                    <p className="mt-6 max-w-sm text-base leading-7 text-white/75">
                        Workouts, food and plans that fit your life. No noise. Just a clear next step.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/workouts" className="button-orange">Find your workout <span aria-hidden="true">↗</span></Link>
                        <Link to="/dashboard" className="button-outline-light">My progress</Link>
                    </div>
                </div>
                <div className="home-hero-mark" aria-hidden="true">
                    <span>FiTrack</span>
                    <b>EST.<br />YOUR<br />PACE.</b>
                    <small>TRAINING / WELLNESS / YOU</small>
                </div>
                <div className="home-hero-index"><span>01</span> / EVERY DAY COUNTS</div>
            </section>

            <div className="home-ticker" aria-label="Train, fuel, repeat">
                <span>TRAIN</span><i>✳</i><span>FUEL</span><i>✳</i><span>REPEAT</span><i>✳</i><span>SHOW UP</span><i>✳</i><span>TRAIN</span>
            </div>

            <section className="pathway-section">
                <div className="pathway-heading">
                    <p className="eyebrow">The FiTrack method</p>
                    <h2>GOOD DAYS<br /><span>ADD UP.</span></h2>
                </div>
                <div className="pathway-list">
                    {pathways.map(([to, number, title, text]) => (
                        <Link key={to} to={to} className="pathway-row">
                            <span className="pathway-number">{number}</span>
                            <span className="pathway-name">{title}</span>
                            <span className="pathway-detail">{text}</span>
                            <span className="pathway-arrow" aria-hidden="true">↗</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section id="start" className="home-plan">
                <div className="home-plan-copy">
                    <p className="eyebrow text-white/65">Start where you are</p>
                    <h2>MAKE A PLAN.<br /><span>MAKE IT YOURS.</span></h2>
                    <p>Set a goal that feels right for you. FiTrack will turn it into a weekly path you can actually follow.</p>
                    <div className="plan-note"><span>✳</span> Small steps. Real momentum.</div>
                </div>
                <div className="home-plan-form"><GoalForm /></div>
            </section>
        </main>
    );
}
