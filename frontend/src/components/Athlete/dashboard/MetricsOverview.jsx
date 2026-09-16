import React from 'react';

export default function MetricsOverview({ latestMetric, metric }) {
  // Gracefully accept either prop name from parent components
  const data = latestMetric || metric || {};

  // Unpack backend telemetry values with default fallbacks
  const readiness = Math.round(data.readinessScore ?? data.readiness ?? 0);
  const ctl = Math.round(data.ctl ?? 0);
  const atl = Math.round(data.atl ?? 0);
  const tsb = Math.round(data.tsb ?? (ctl - atl));

  // Dynamic readiness badge evaluation
  const getReadinessBadge = (val) => {
    if (val >= 75) return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (val >= 60) return { label: 'Good', color: 'bg-blue-300/10 text-blue-300 border-blue-300/20' };
    if (val >= 40) return { label: 'Moderate', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    return { label: 'Fatigued', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
  };

  // Dynamic Form (TSB) badge evaluation
  const getTsbBadge = (val) => {
    if (val > 10) return { label: 'Fresh', color: 'bg-blue-300/10 text-blue-300 border-blue-300/20' };
    if (val >= -10) return { label: 'Neutral', color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' };
    if (val >= -30) return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    return { label: 'Overreaching', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
  };

  const readinessBadge = getReadinessBadge(readiness);
  const tsbBadge = getTsbBadge(tsb);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Readiness Card */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase">Readiness</span>
          <span className={`px-2 py-0.5 border text-[10px] rounded-md font-semibold font-mono ${readinessBadge.color}`}>
            {readinessBadge.label}
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono my-2">
          {readiness}<span className="text-sm text-zinc-400 font-normal">%</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-zinc-400 border-t border-white/10 pt-2 font-mono">
          <span>Target &gt; 60%</span>
          <div className="w-16 bg-[#121212] h-1.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-blue-300 h-full transition-all duration-300" 
              style={{ width: `${Math.min(Math.max(readiness, 0), 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Fitness (CTL) Card */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase">Fitness (CTL)</span>
          <span className="px-2 py-0.5 bg-blue-300/10 text-blue-300 border border-blue-300/20 text-[10px] rounded-md font-semibold font-mono">
            42-Day Avg
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 my-2 font-mono">
          <span className="text-3xl font-extrabold text-white">{ctl}</span>
          <span className="text-xs text-zinc-400">TSS/d</span>
        </div>
        <p className="text-[10px] text-zinc-400 border-t border-white/10 pt-2 truncate font-mono">
          Chronic Training Load
        </p>
      </div>

      {/* Fatigue (ATL) Card */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase">Fatigue (ATL)</span>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] rounded-md font-semibold font-mono">
            7-Day Avg
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 my-2 font-mono">
          <span className="text-3xl font-extrabold text-white">{atl}</span>
          <span className="text-xs text-zinc-400">TSS/d</span>
        </div>
        <p className="text-[10px] text-zinc-400 border-t border-white/10 pt-2 truncate font-mono">
          Acute Training Load
        </p>
      </div>

      {/* Form (TSB) Card */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase">Form (TSB)</span>
          <span className={`px-2 py-0.5 border text-[10px] rounded-md font-semibold font-mono ${tsbBadge.color}`}>
            {tsbBadge.label}
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono my-2">
          {tsb}
        </div>
        <p className="text-[10px] text-zinc-400 border-t border-white/10 pt-2 truncate font-mono">
          Target race window (-10 to -30)
        </p>
      </div>
    </div>
  );
}