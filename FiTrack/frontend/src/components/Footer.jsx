import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import footerArtwork from "../assets/footer-couple-exercise.jpg";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Workouts", to: "/workouts" },
  { label: "Nutrition", to: "/nutrition" },
  { label: "Schedule", to: "/schedule" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-[#271C5E] text-white">
      <div
        className="absolute inset-y-0 right-0 w-[42%] opacity-55"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(90deg, #271C5E 0%, rgba(39,28,94,.15) 48%, transparent 100%), url(${footerArtwork})`,
          backgroundPosition: "left center, right 58%",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundSize: "100% 100%, cover",
        }}
      />

      <div className="relative mx-auto max-w-[1480px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_.7fr_.7fr]">
          <div className="max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-2xl font-black tracking-tight text-white"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f86d29] text-lg text-[#271C5E]">
                F
              </span>
              <span>Fi<span className="text-[#f86d29]">Track</span></span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Build stronger routines, follow your progress, and make every
              workout count.
            </p>

            <Link
              to="/dashboard"
              className="mt-7 inline-flex items-center gap-2 border-b border-[#f86d29] pb-1 text-sm font-black uppercase tracking-[.16em] text-white"
            >
              Open your dashboard
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <nav aria-label="Fitness links">
            <p className="eyebrow mb-5 text-[#f86d29]">Explore</p>
            <div className="flex flex-col gap-3">
              {footerLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-bold text-white/75 transition hover:text-[#f86d29]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Company links">
            <p className="eyebrow mb-5 text-[#f86d29]">FiTrack</p>
            <div className="flex flex-col gap-3">
              {companyLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-bold text-white/75 transition hover:text-[#f86d29]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-6 text-xs font-bold text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>FiTrack © {new Date().getFullYear()} · Train with purpose</span>
          <div className="flex items-center gap-4" aria-label="Social links">
            <a href="https://instagram.com" aria-label="Instagram" className="transition hover:text-[#f86d29]">IG</a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="transition hover:text-[#f86d29]">LI</a>
            <a href="https://youtube.com" aria-label="YouTube" className="transition hover:text-[#f86d29]">YT</a>
          </div>
        </div>
      </div>
    </footer>
  );
}