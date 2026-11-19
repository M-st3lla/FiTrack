import { useState } from "react";
import PageHeader from "../components/PageHeader";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setSent(false);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (form.name.trim().length < 2) errs.name = "Enter your name (at least 2 characters)";
        if (!emailRe.test(form.email)) errs.email = "Enter a valid email address";
        if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
        setErrors(errs);
        if (Object.keys(errs).length) return;

        // TODO: POST to the backend when it exists.
        setSent(true);
        setForm({ name: "", email: "", message: "" });
    };

    const cls = (k) =>
        `mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 ${errors[k] ? "border-red-400" : "border-slate-300"
        }`;

    return (
        <div>
            <PageHeader title="Contact" subtitle="Questions or feedback? Send us a message." />

            <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <label className="block">
                    <span className="text-sm font-medium">Name</span>
                    <input name="name" value={form.name} onChange={onChange} className={cls("name")} />
                    {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input type="email" name="email" value={form.email} onChange={onChange} className={cls("email")} />
                    {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Message</span>
                    <textarea name="message" rows={5} value={form.message} onChange={onChange} className={cls("message")} />
                    {errors.message && <span className="text-xs text-red-600">{errors.message}</span>}
                </label>

                {sent && <p className="text-sm text-emerald-700">Thanks! Your message has been sent ✓</p>}

                <button className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
                    Send message
                </button>
            </form>
        </div>
    );
}