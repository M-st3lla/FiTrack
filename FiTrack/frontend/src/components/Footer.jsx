export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#271C5E]/10 bg-[#f7f7fb] px-6 py-8 text-xs font-medium text-[#271C5E]/50">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-2 sm:flex-row sm:justify-between">
        <span className="font-black text-[#271C5E]">Fi<span className="text-[#f86d29]">Track</span> © {new Date().getFullYear()}</span>
        <span>TRAIN WITH PURPOSE · LIVE WITH ENERGY</span>
      </div>
    </footer>
  );
}