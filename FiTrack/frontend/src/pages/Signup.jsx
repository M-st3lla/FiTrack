
import { Link } from "react-router-dom";
import { useState } from "react";
import {
    Activity,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    UserRound,
    Sparkles,
    Dumbbell,
    Salad,
    CalendarDays,
} from "lucide-react";

export default function Signup({ onSignup }) {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        goal: "Build strength",
        terms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const update = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.password.length < 8) {
            setError("Use a password with at least 8 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        if (!form.terms) {
            setError("Please agree to the Terms and Privacy Policy.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const { confirmPassword, terms, ...payload } = form;

            if (onSignup) {
                await onSignup(payload);
            } else {
                console.info("FiTrack sign-up form:", payload);
                setError(
                    "Your signup form is working, but account creation is not connected to the backend yet."
                );
            }
        } catch (err) {
            setError(
                err?.message || "We couldn't create your account. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-[#dce6dd] bg-white/90 py-3.5 pl-11 pr-4 text-sm text-[#19382f] outline-none transition placeholder:text-[#9aa9a0] focus:border-[#39815e] focus:ring-4 focus:ring-[#39815e]/10";

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

                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#d8efc6]">
                            <Sparkles size={14} />
                            YOUR ROUTINE, REIMAGINED
                        </span>

                        <h1 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">
                            Make room for a{" "}
                            <span className="text-[#b8e986]">stronger</span> you.
                        </h1>

                        <p className="mt-5 max-w-sm text-base leading-7 text-[#d3e2d9]">
                            Fitness that fits your life. Build a realistic routine around
                            your goals, your schedule and what you have available.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                {
                                    icon: Dumbbell,
                                    title: "Workouts that fit your setup",
                                    detail: "From bodyweight sessions to full-gym plans.",
                                },
                                {
                                    icon: Salad,
                                    title: "Nutrition made practical",
                                    detail: "Make smarter food choices with everyday options.",
                                },
                                {
                                    icon: CalendarDays,
                                    title: "A plan you can actually follow",
                                    detail: "Keep your sessions visible and on schedule.",
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

                {/* RIGHT SIGNUP SECTION */}
                <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">

                        {/* MOBILE LOGO */}
                        <Link to="/" className="mb-9 inline-flex items-center gap-2 lg:hidden">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#123c32] text-[#b8e986]">
                                <Activity size={19} />
                            </span>

                            <span className="text-xl font-black tracking-tight">
                                FiTrack<span className="text-[#39815e]">.</span>
                            </span>
                        </Link>

                        <div className="mb-8">
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#39815e]">
                                Start with a goal
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[#173b30] sm:text-[2.1rem]">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#78877e]">
                                Set up your space. You can fine-tune your fitness plan later.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* FULL NAME */}
                            <div>
                                <label htmlFor="fullName" className="mb-2 block text-xs font-semibold text-[#344d41]">
                                    Full name
                                </label>

                                <div className="relative">
                                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]" size={17} />

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        autoComplete="name"
                                        required
                                        value={form.fullName}
                                        onChange={update}
                                        placeholder="e.g. Alex Mwangi"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#344d41]">
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]" size={17} />

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

                            {/* FITNESS GOAL */}
                            <div>
                                <label htmlFor="goal" className="mb-2 block text-xs font-semibold text-[#344d41]">
                                    What would you like to focus on?
                                </label>

                                <select
                                    id="goal"
                                    name="goal"
                                    value={form.goal}
                                    onChange={update}
                                    className="w-full rounded-xl border border-[#dce6dd] bg-white px-4 py-3.5 text-sm text-[#19382f] outline-none focus:border-[#39815e] focus:ring-4 focus:ring-[#39815e]/10"
                                >
                                    <option>Build strength</option>
                                    <option>Build muscle</option>
                                    <option>Improve cardiovascular fitness</option>
                                    <option>Manage my weight</option>
                                    <option>Improve general fitness</option>
                                    <option>Build healthier habits</option>
                                </select>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#344d41]">
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]" size={17} />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        value={form.password}
                                        onChange={update}
                                        placeholder="At least 8 characters"
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

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold text-[#344d41]">
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a198]" size={17} />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={form.confirmPassword}
                                        onChange={update}
                                        placeholder="Enter your password again"
                                        className={`${inputClass} pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((value) => !value)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#829188] hover:bg-[#f1f5ef]"
                                    >
                                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* TERMS */}
                            <label className="flex cursor-pointer items-start gap-3 pt-1 text-xs leading-5 text-[#718077]">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={form.terms}
                                    onChange={update}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#247a58]"
                                />

                                <span>
                                    I agree to the{" "}
                                    <a href="/terms" className="font-semibold text-[#247a58] underline">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="/privacy" className="font-semibold text-[#247a58] underline">
                                        Privacy Policy
                                    </a>.
                                </span>
                            </label>

                            {/* ERROR MESSAGE */}
                            {error && (
                                <p role="alert" className="rounded-xl border border-[#f1c7bd] bg-[#fff5f1] px-4 py-3 text-xs leading-5 text-[#a34231]">
                                    {error}
                                </p>
                            )}

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#247a58] px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#185f43] disabled:opacity-60"
                            >
                                {submitting ? "Creating your account..." : "Create my account"}

                                {!submitting && (
                                    <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                                )}
                            </button>
                        </form>

                        {/* LOGIN LINK */}
                        <p className="mt-7 text-center text-sm text-[#829087]">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-[#247a58] hover:underline">
                                Log in
                            </Link>
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-medium text-[#9aa79f]">
                            <span className="text-[#39815e]">✓</span>
                            Your fitness journey, organised in one place
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
