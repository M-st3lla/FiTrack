import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { WORKOUTS } from "../data/workouts";

// Rules: [min, max, label]
const RULES = {
  age: [12, 100, "Age"],
  weight: [20, 300, "Weight (kg)"],
  height: [100, 250, "Height (cm)"],
  caloriesToBurn: [100, 100000, "Calories to burn"],
  weeks: [1, 52, "Period (weeks)"],
};

function Field({ name, label, value, onChange, error, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

export default function GoalForm() {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: profile?.age ?? "",
    weight: profile?.weight ?? "",
    height: profile?.height ?? "",
    caloriesToBurn: profile?.caloriesToBurn ?? "",
    weeks: profile?.weeks ?? "",
    goal: profile?.goal ?? "",
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    Object.entries(RULES).forEach(([key, [min, max, label]]) => {
      const n = Number(form[key]);
      if (form[key] === "" || Number.isNaN(n)) errs[key] = `${label} is required`;
      else if (n < min || n > max) errs[key] = `Enter ${min} to ${max}`;
    });
    if (!form.goal) errs.goal = "Choose a goal";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setProfile({
      age: Number(form.age),
      weight: Number(form.weight),
      height: Number(form.height),
      caloriesToBurn: Number(form.caloriesToBurn),
      weeks: Number(form.weeks),
      goal: form.goal,
    });
    navigate("/dashboard");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Set your goal</h2>
      <p className="mb-4 text-sm text-slate-600">Tell us about you and we'll build a weekly path.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="age" label="Age" value={form.age} onChange={onChange} error={errors.age} />
        <Field name="weight" label="Weight (kg)" value={form.weight} onChange={onChange} error={errors.weight} />
        <Field name="height" label="Height (cm)" value={form.height} onChange={onChange} error={errors.height} />
        <Field
          name="caloriesToBurn"
          label="Calories to burn (total)"
          value={form.caloriesToBurn}
          onChange={onChange}
          error={errors.caloriesToBurn}
          hint="Your total target over the period"
        />
        <Field name="weeks" label="Period (weeks)" value={form.weeks} onChange={onChange} error={errors.weeks} />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Goal</span>
          <select
            name="goal"
            value={form.goal}
            onChange={onChange}
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 ${
              errors.goal ? "border-red-400" : "border-slate-300"
            }`}
          >
            <option value="">Select a goal</option>
            {WORKOUTS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {errors.goal && <span className="text-xs text-red-600">{errors.goal}</span>}
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        {profile ? "Update my plan" : "Build my plan"}
      </button>
    </form>
  );
}