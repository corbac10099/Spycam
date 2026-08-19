"use client";

export default function Tooltip({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="group relative inline-flex ml-1.5 cursor-help select-none">
      <div className="w-4 h-4 rounded-full bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/50 flex items-center justify-center text-[10px] font-black text-[var(--color-val-red)] hover:bg-[var(--color-val-red)] hover:text-white transition-colors shadow-sm">
        !
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform group-hover:scale-100 scale-95 origin-bottom">
        <div className="bg-[#161b26] border border-[var(--color-val-red)]/40 rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-primary)] leading-relaxed shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161b26] border-r border-b border-[var(--color-val-red)]/40 rotate-45 -mt-1"></div>
        </div>
      </div>
    </div>
  );
}
