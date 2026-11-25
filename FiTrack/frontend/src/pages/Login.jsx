
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Dumbbell,
    Salad,
    CalendarDays,
} from "lucide-react";

export default function Login({ onLogin }) {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const update = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!onLogin) {
            setError("Login service is not connected yet.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            await onLogin(form);
        } catch (err) {
            setError(
                err?.message || "Invalid email or password. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-[#dce6dd] bg-white py-3.5 pl-11 pr-4 text-sm text-[#19382f] outline-none transition placeholder:text-[#9aa9a0] focus:border-[#39815e] focus:ring-4 focus:ring-[#39815e]/10";

    return (
        <main className="min-h-screen bg-[#f4f7f1] px-4 py-6 text-[#19382f] sm:px-6 lg:px-10">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_-35px_rgba(18,60,50,0.28)] lg:grid-cols-[0.95fr_1.05fr]">

                {/* LEFT BRAND SECTION */}
                <section className="relative hidden overflow-hidden bg-[#123c32] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
                    <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10" />
                    <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-[#b8e986]/10 blur-2xl" />

                    <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b8e986] text-[#123c32]">
                            <Activity size={23} strokeWidth={2.7} />
                        </span>

                        <span className="text-2xl font-black tracking-tight">
                            FiTrack<span className="text-[#b8e986]">.</span>
                        </span>
                    </Link>

                    <div className="relative z-10 my-12 max-w-md">
                        <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#d8efc6]">
                            WELCOME BACK
                        </span>

                        <h1 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">
                            Your goals are waiting.{" "}
                            <span className="text-[#b8e986]">Let's get moving.</span>
                        </h1>

                        <p className="mt-5 max-w-sm text-base leading-7 text-[#d3e2d9]">
                            Pick up where you left off. Keep your workouts, nutrition
                            and schedule working together.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                {
                                    icon: Dumbbell,
                                    title: "Stay consistent",
                                    detail: "Keep working towards your fitness goals.",
                                },
                                {
                                    icon: Salad,
                                    title: "Stay on track",
                                    detail: "Make practical nutrition choices.",
                                },
                                {
                                    icon: CalendarDays,
                                    title: "Stay organised",
                                    detail: "Keep your routine visible and manageable.",
                                },
                            ].map(({ icon: Icon, title, detail }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#b8e986]">
                                        <Icon size={19} />
                                    </span>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {title}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#b8cfc1]">
                                            {detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-[#a9c4b5]">
                        Small steps. Steady progress. Your pace.
                    </p>
                </section>

                {/* LOGIN FORM */}
                <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">

                        {/* MOBILE LOGO */}
                        <Link to="/" className="mb-10 inline-flex items-center gap-2 lg:hidden">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#123c32] text-[#b8e986]">
                                <Activity size={19} />
                            </span>

                            <span className="text-xl font-black tracking-tight">
                                FiTrack<span className="text-[#39815e]">.</span>
                            </span>
                        </Link>

                        <div className="mb-9">
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#39815e]">
                                YOUR FITNESS JOURNEY CONTINUES
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[#173b30] sm:text-[2.1rem]">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#78877e]">
                                Log in to access your personalised fitness dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-xs font-semibold text-[#344d41]"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]"
                                        size={17}
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={form.email}
                                        onChange={update}
                                        placeholder="you@example.com"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-[#344d41]"
                                    >
                                        Password
                                    </label>
                                </div>

                                <div className="relative">
                                    <LockKeyhole
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]"
                                        size={17}
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={form.password}
                                        onChange={update}
                                        placeholder="Enter your password"
                                        className={`${inputClass} pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#829188] hover:bg-[#f1f5ef]"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-[#f1c7bd] bg-[#fff5f1] px-4 py-3 text-xs leading-5 text-[#a34231]"
                                >
                                    {error}
                                </p>
                            )}

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#247a58] px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#185f43] disabled:opacity-60"
                            >
                                {submitting ? "Logging in..." : "Log in"}

                                {!submitting && (
                                    <ArrowRight
                                        size={17}
                                        className="transition group-hover:translate-x-1"
                                    />
                                )}
                            </button>
                        </form>

                        {/* SIGNUP ROUTE */}
                        <div className="mt-8 rounded-xl border border-[#e3ebe3] bg-[#f8faf6] px-4 py-5 text-center">
                            <p className="text-sm text-[#78877e]">
                                Don't have an account yet?
                            </p>

                            <Link
                                to="/signup"
                                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#247a58] hover:underline"
                            >
                                Create an account
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <p className="mt-8 text-center text-[11px] font-medium text-[#9aa79f]">
                            Your fitness journey, organised in one place.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
