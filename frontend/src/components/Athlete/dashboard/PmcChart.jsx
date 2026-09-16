import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function PmcChart({ metrics = [] }) {
  const [range, setRange] = useState('30D');
  const [chartView, setChartView] = useState('pmc');

  const chartData = useMemo(() => {
    if (!Array.isArray(metrics) || metrics.length === 0) return [];

    const sorted = [...metrics].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const rangeDays = range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90 : sorted.length;
    const sliced = sorted.slice(-rangeDays);

    return sliced.map((item) => {
      const d = new Date(item.date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${month}/${day}`;
      
      const ctl = Math.round(Number(item.ctl ?? 0));
      const atl = Math.round(Number(item.atl ?? 0));
      const tsb = Math.round(Number(item.tsb ?? (ctl - atl)));
      const tss = Math.round(Number(item.dayTss ?? item.tss ?? 0));
      const hrv = Math.round(Number(item.recovery?.hrvRmssd ?? item.hrv ?? 0));
      const restingHr = Math.round(Number(item.recovery?.restingHr ?? item.restingHr ?? 0));

      return {
        rawDate: item.date,
        date: formattedDate,
        ctl,
        atl,
        tsb,
        tss,
        hrv,
        restingHr,
      };
    });
  }, [metrics, range]);

  const latest = chartData[chartData.length - 1] || { ctl: 0, atl: 0, tsb: 0 };

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between h-full font-sans">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/10 shrink-0">
        <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">
          {chartView === 'pmc' && 'Performance Management ($CTL / $ATL / $TSB)'}
          {chartView === 'hrv' && 'HRV & Resting Heart Rate Trends'}
          {chartView === 'volume' && 'Daily Stress Score (TSS) Volume'}
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setChartView('pmc')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-colors ${
                chartView === 'pmc' ? 'bg-blue-300/20 text-blue-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              PMC
            </button>
            <button
              onClick={() => setChartView('hrv')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-colors ${
                chartView === 'hrv' ? 'bg-blue-300/20 text-blue-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              HRV
            </button>
            <button
              onClick={() => setChartView('volume')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-colors ${
                chartView === 'volume' ? 'bg-blue-300/20 text-blue-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>

          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/10">
            {['7D', '30D', '90D', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-colors ${
                  range === r ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Viewport - STRETCHES VERTICALLY */}
      <div className="flex-1 min-h-0 w-full my-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
            <span>No telemetry metrics recorded for this timeframe.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'pmc' ? (
              <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={2} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomPmcTooltip />} />
                <Line type="monotone" dataKey="tsb" stroke="#34d399" strokeWidth={2} dot={false} name="Form (TSB)" />
                <Line type="monotone" dataKey="atl" stroke="#fbbf24" strokeWidth={2} dot={false} name="Fatigue (ATL)" />
                <Line type="monotone" dataKey="ctl" stroke="#93c5fd" strokeWidth={2.5} dot={false} name="Fitness (CTL)" />
              </ComposedChart>
            ) : chartView === 'hrv' ? (
              <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={2} />
                <YAxis yAxisId="hrv" stroke="#93c5fd" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <YAxis yAxisId="rhr" orientation="right" stroke="#f87171" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomHrvTooltip />} />
                <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#93c5fd" strokeWidth={2} dot={{ r: 2 }} name="HRV (ms)" />
                <Line yAxisId="rhr" type="monotone" dataKey="restingHr" stroke="#f87171" strokeWidth={2} dot={{ r: 2 }} name="Resting HR (bpm)" />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={2} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomVolumeTooltip />} />
                <Bar dataKey="tss" fill="#93c5fd" radius={[4, 4, 0, 0]} opacity={0.8} name="Daily TSS" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Legend Bar */}
      <div className="flex items-center justify-center gap-6 border-t border-white/10 pt-2 text-[10px] font-mono shrink-0">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-blue-300" />
          Fitness (CTL): <strong className="text-white">{latest.ctl}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Fatigue (ATL): <strong className="text-white">{latest.atl}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Form (TSB): <strong className="text-white">{latest.tsb}</strong>
        </span>
      </div>
    </div>
  );
}

function CustomPmcTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-lg p-2 shadow-xl font-mono text-[10px] space-y-1">
        <div className="text-zinc-400 border-b border-white/10 pb-0.5 mb-1 font-semibold">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex justify-between items-center gap-3" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomHrvTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-lg p-2 shadow-xl font-mono text-[10px] space-y-1">
        <div className="text-zinc-400 border-b border-white/10 pb-0.5 mb-1 font-semibold">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex justify-between items-center gap-3" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomVolumeTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-lg p-2 shadow-xl font-mono text-[10px]">
        <div className="text-zinc-400 border-b border-white/10 pb-0.5 mb-1 font-semibold">{label}</div>
        <div className="flex justify-between items-center gap-3 text-blue-300">
          <span>Training Stress (TSS):</span>
          <span className="font-bold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
}