export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-10 border-b border-[#271C5E]/10 pb-7">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#f86d29]">FiTrack / Training</p>
      <h1 className="text-4xl font-black tracking-tight text-[#271C5E] md:text-6xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-[#271C5E]/55">{subtitle}</p>}
    </div>
  );
}