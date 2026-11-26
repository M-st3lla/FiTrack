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
        `fitness-field ${errors[k] ? "border-red-400" : ""
        }`;

    return (
        <div>
            <PageHeader title="Let's talk" subtitle="Questions, feedback or an idea for FiTrack? We’re listening." />

            <div className="contact-layout">
                <aside className="contact-callout">
                    <span className="eyebrow">We’re here</span>
                    <strong>GOOD<br />ENERGY<br />ONLY.</strong>
                    <p>Send a note and help us make FiTrack better for your training routine.</p>
                    <span className="contact-star" aria-hidden="true">✳</span>
                </aside>
                <form onSubmit={onSubmit} noValidate className="contact-form space-y-5">
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

                {sent && <p className="text-sm font-bold text-[#4023CE]">Thanks! Your message has been sent ✓</p>}

                <button className="rounded-full bg-[#f86d29] px-7 py-3.5 text-sm font-black text-[#271C5E] hover:bg-[#ff8c53]">
                    Send message
                </button>
                </form>
            </div>
        </div>
    );
}