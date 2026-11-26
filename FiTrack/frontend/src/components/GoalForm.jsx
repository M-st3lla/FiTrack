
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { TRAINING_LEVELS } from "../data/workouts";

// Rules: [min, max, label]
const RULES = {
  age: [12, 100, "Age"],
  weight: [20, 300, "Weight (kg)"],
  height: [100, 250, "Height (cm)"],
  caloriesToBurn: [100, 10000, "Calories to burn"],
  weeks: [1, 52, "Period (weeks)"],
};

function Field({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  min,
  max,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-[#271C5E]/65">
        {label}
      </span>

      <input
        id={name}
        type="number"
        name={name}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`fitness-field ${error ? "border-red-400" : ""}`}
      />

      {hint && !error && (
        <span className="text-[10px] text-[#271C5E]/40">
          {hint}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function GoalForm() {
  const {
    user,
    profile,
    workouts,
    catalogLoading,
    accountLoading,
    accountError,
    saveProfile,
  } = useApp();

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Save your fitness plan
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Create an account or log in so your profile and goals are saved to the database.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            to="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Create account
          </Link>

          <Link
            to="/login"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (accountLoading) {
    return (
      <p
        role="status"
        className="rounded-xl bg-white p-6 text-sm text-slate-500"
      >
        Loading your saved plan…
      </p>
    );
  }

  return (
    <GoalFormFields
      profile={profile}
      workouts={workouts}
      catalogLoading={catalogLoading}
      accountError={accountError}
      saveProfile={saveProfile}
    />
  );
}

function GoalFormFields({
  profile,
  workouts,
  catalogLoading,
  accountError,
  saveProfile,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: profile?.age ?? "",
    weight: profile?.weight ?? "",
    height: profile?.height ?? "",
    caloriesToBurn: profile?.caloriesToBurn || "",
    caloriesMode: profile
      ? profile.caloriesToBurn > 0
        ? "custom"
        : "unknown"
      : "custom",
    weeks: profile?.weeks ?? "",
    goal: profile?.goal ?? "",
    fitnessLevel: profile?.fitnessLevel ?? "beginner",
  });

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      const field =
        name === "caloriesMode" ? "caloriesToBurn" : name;

      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errs = {};

    Object.entries(RULES)
      .filter(
        ([key]) =>
          key !== "caloriesToBurn" ||
          form.caloriesMode === "custom"
      )
      .forEach(([key, [min, max, label]]) => {
        const n = Number(form[key]);

        if (form[key] === "" || Number.isNaN(n)) {
          errs[key] = `${label} is required`;
        } else if (n < min || n > max) {
          errs[key] = `Enter ${min} to ${max}`;
        }
      });

    if (!form.goal) {
      errs.goal = "Choose a goal";
    }

    setErrors(errs);

    if (Object.keys(errs).length) return;

    setSaving(true);
    setSaveError("");

    try {
      await saveProfile({
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        caloriesToBurn:
          form.caloriesMode === "custom"
            ? Number(form.caloriesToBurn)
            : null,
        weeks: Number(form.weeks),
        goal: form.goal,
        fitnessLevel: form.fitnessLevel,
      });

      navigate("/dashboard");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="fitness-form rounded-[1.5rem] bg-white p-6 text-[#271C5E] shadow-[0_24px_70px_-35px_rgba(39,28,94,.7)]"
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f86d29]">
            Personal plan
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Set your goal
          </h2>
        </div>

        <span className="text-3xl text-[#f86d29]">＋</span>
      </div>

      <p className="mb-4 mt-2 text-sm text-[#271C5E]/60">
        Tell us about you and we’ll save a weekly path to your account.
      </p>

      {accountError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {accountError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="age"
          label="Age"
          value={form.age}
          onChange={onChange}
          error={errors.age}
        />

        <Field
          name="weight"
          label="Weight (kg)"
          value={form.weight}
          onChange={onChange}
          error={errors.weight}
        />

        <Field
          name="height"
          label="Height (cm)"
          value={form.height}
          onChange={onChange}
          error={errors.height}
        />

        <div className="block">
          <label
            htmlFor="caloriesMode"
            className="text-xs font-bold text-[#271C5E]/65"
          >
            Calories to burn (total)
          </label>

          <select
            id="caloriesMode"
            name="caloriesMode"
            value={form.caloriesMode}
            onChange={onChange}
            className="fitness-field"
          >
            <option value="custom">Enter a target</option>
            <option value="unknown">I’m not sure</option>
          </select>

          {form.caloriesMode === "custom" ? (
            <Field
              name="caloriesToBurn"
              label="Total target (kcal)"
              value={form.caloriesToBurn}
              onChange={onChange}
              error={errors.caloriesToBurn}
              min={RULES.caloriesToBurn[0]}
              max={RULES.caloriesToBurn[1]}
              placeholder="e.g. 5000"
              hint="Your total target over the period"
            />
          ) : (
            <span className="text-xs text-[#271C5E]/55">
              You can add a calorie target later.
            </span>
          )}
        </div>

        <Field
          name="weeks"
          label="Period (weeks)"
          value={form.weeks}
          onChange={onChange}
          error={errors.weeks}
        />

        <label className="block">
          <span className="text-xs font-bold text-[#271C5E]/65">
            Training level
          </span>

          <select
            name="fitnessLevel"
            value={form.fitnessLevel}
            onChange={onChange}
            className="fitness-field"
          >
            {TRAINING_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-[#271C5E]/65">
            Goal
          </span>

          <select
            name="goal"
            value={form.goal}
            onChange={onChange}
            className={`fitness-field ${errors.goal ? "border-red-400" : ""
              }`}
          >
            <option value="">Select a goal</option>

            {workouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {errors.goal && (
            <span className="text-xs text-red-600">
              {errors.goal}
            </span>
          )}

          {catalogLoading && (
            <span
              role="status"
              className="text-xs text-slate-500"
            >
              Loading workout categories…
            </span>
          )}
        </label>
      </div>

      {saveError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {saveError}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || catalogLoading || !workouts.length}
        className="mt-6 w-full rounded-full bg-[#f86d29] px-4 py-3 text-sm font-black text-[#271C5E] transition hover:bg-[#ff8c53] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Saving…"
          : profile?.goal && profile?.age
            ? "Update my plan"
            : "Build my plan"}
      </button>
    </form>
  );
}
