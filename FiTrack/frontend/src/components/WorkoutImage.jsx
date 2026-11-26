export default function WorkoutImage({ workout, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`workout-image ${className}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(39, 28, 94, .08), rgba(39, 28, 94, .46)), url("${workout.image}")`,
      }}
    />
  );
}
