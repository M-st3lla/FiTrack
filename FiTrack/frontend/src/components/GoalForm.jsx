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
      <span className="text-xs font-bold text-[#271C5E]/65">{label}</span>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className={`fitness-field ${error ? "border-red-400" : ""}`}
      />
      {hint && !error && <span className="text-[10px] text-[#271C5E]/40">{hint}</span>}
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
  <form onSubmit={onSubmit} noValidate className="fitness-form rounded-[1.5rem] bg-white p-6 text-[#271C5E] shadow-[0_24px_70px_-35px_rgba(39,28,94,.7)]">
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f86d29]">Personal plan</p>
        <h2 className="mt-1 text-2xl font-black">Set your goal</h2>
      </div>
      <span className="text-3xl text-[#f86d29]">＋</span>
    </div>

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
          <span className="text-xs font-bold text-[#271C5E]/65">Goal</span>
          <select
            name="goal"
            value={form.goal}
            onChange={onChange}
            className={`fitness-field ${
              errors.goal ? "border-red-400" : ""
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
        className="mt-6 w-full rounded-full bg-[#f86d29] px-4 py-3 text-sm font-black text-[#271C5E] transition hover:bg-[#ff8c53]"
      >
        {profile ? "Update my plan" : "Build my plan"}
      </button>
    </form>
  );
}