import React, { useState, useMemo } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { FaArrowLeft } from 'react-icons/fa';
import { MdDirectionsRun, MdDirectionsBike, MdPool } from 'react-icons/md';

export default function ActivityTabs({ activities = [] }) {
  const [activeTab, setActiveTab] = useState("Recent & Planned");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 3;

  const weeklyLoadData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayTss = [0, 0, 0, 0, 0, 0, 0];
    let totalTss = 0;

    activities.forEach((act) => {
      const d = new Date(act.date || Date.now());
      let dayIdx = d.getDay() - 1;
      if (dayIdx === -1) dayIdx = 6;
      const tss = act.actual?.tss || act.planned?.tss || act.tss || 0;
      dayTss[dayIdx] += Number(tss);
      totalTss += Number(tss);
    });

    return { days, dayTss, totalTss };
  }, [activities]);

  const distributionData = useMemo(() => {
    const totals = { running: 0, cycling: 0, swimming: 0, other: 0 };
    let grandTotal = 0;

    activities.forEach((act) => {
      const sport = (act.sport || 'running').toLowerCase();
      const dur = act.actual?.durationMinutes || act.duration || 60;
      if (totals[sport] !== undefined) totals[sport] += dur;
      else totals.other += dur;
      grandTotal += dur;
    });

    return { totals, grandTotal: grandTotal || 1 };
  }, [activities]);

  const paginatedActivities = activities.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-5 min-h-[300px] flex flex-col justify-between">
      {selectedActivity ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedActivity(null)} className="flex items-center gap-2 text-xs font-semibold text-blue-300 hover:text-white transition">
            <FaArrowLeft size={12} /> Back to Hub
          </button>
          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <SportBadge sport={selectedActivity.sport} />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedActivity.title || 'Training Session'}</h3>
                  <p className="text-xs text-zinc-400">{new Date(selectedActivity.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center font-mono">
              <div className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">Distance</p>
                <p className="text-xs font-bold text-white">{selectedActivity.actual?.distance || selectedActivity.distance || '0'} km</p>
              </div>
              <div className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">Duration</p>
                <p className="text-xs font-bold text-white">{selectedActivity.actual?.duration || selectedActivity.duration || '0m'}</p>
              </div>
              <div className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">Avg HR</p>
                <p className="text-xs font-bold text-white">{selectedActivity.actual?.avgHr || selectedActivity.avgHr || '--'} bpm</p>
              </div>
              <div className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">TSS Load</p>
                <p className="text-xs font-bold text-blue-300">{selectedActivity.actual?.tss || selectedActivity.tss || '0'} TSS</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <HiOutlineLightningBolt className="text-blue-300" size={18} />
                <h2 className="text-xs font-bold tracking-tight text-white uppercase">Activity Log & Analytics</h2>
              </div>
              <div className="flex bg-[#121212] p-1 rounded-xl border border-white/10 text-[11px]">
                {["Recent & Planned", "Weekly Load", "Distribution"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-lg font-medium transition ${activeTab === tab ? 'bg-[#1e1e1e] text-blue-300 font-semibold border border-white/10' : 'text-zinc-400 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Recent & Planned" && (
              <div className="space-y-2">
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((act, i) => (
                    <div key={act._id || i} onClick={() => setSelectedActivity(act)} className="flex items-center justify-between p-3 bg-[#121212] border border-white/10 rounded-xl hover:border-blue-300/40 cursor-pointer transition">
                      <div className="flex items-center gap-3">
                        <SportBadge sport={act.sport} />
                        <div>
                          <h3 className="text-xs font-bold text-white">{act.title || 'Training Session'}</h3>
                          <p className="text-[11px] text-zinc-400">{new Date(act.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-blue-300 font-mono font-semibold text-xs">{act.actual?.tss || act.tss || '0'} TSS</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-white/10 rounded-xl">No logs recorded.</div>
                )}
              </div>
            )}

            {activeTab === "Weekly Load" && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Total Accumulation</span>
                  <span className="text-blue-300 font-bold font-mono">{weeklyLoadData.totalTss} TSS</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
                  {weeklyLoadData.days.map((day, i) => (
                    <div key={day} className="bg-[#1e1e1e] p-2 rounded-lg border border-white/5">
                      <span className="text-zinc-400 block">{day}</span>
                      <span className="font-bold text-white mt-1 block">{weeklyLoadData.dayTss[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Distribution" && (
              <div className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
                <DistributionBar label="Cycling" minutes={distributionData.totals.cycling} total={distributionData.grandTotal} color="bg-amber-400" />
                <DistributionBar label="Running" minutes={distributionData.totals.running} total={distributionData.grandTotal} color="bg-emerald-400" />
                <DistributionBar label="Swimming" minutes={distributionData.totals.swimming} total={distributionData.grandTotal} color="bg-blue-300" />
              </div>
            )}
          </div>

          {activeTab === "Recent & Planned" && activities.length > ITEMS_PER_PAGE && (
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 text-xs text-zinc-400">
              <span>Page {page + 1} of {Math.ceil(activities.length / ITEMS_PER_PAGE)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => page > 0 && setPage(page - 1)} disabled={page === 0} className="p-1.5 rounded-lg bg-[#121212] border border-white/10 disabled:opacity-30"><IoChevronBackOutline size={14} /></button>
                <button onClick={() => (page + 1) * ITEMS_PER_PAGE < activities.length && setPage(page + 1)} disabled={(page + 1) * ITEMS_PER_PAGE >= activities.length} className="p-1.5 rounded-lg bg-[#121212] border border-white/10 disabled:opacity-30"><IoChevronForwardOutline size={14} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DistributionBar({ label, minutes, total, color }) {
  const pct = Math.round((minutes / total) * 100) || 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1 font-mono">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">{(minutes / 60).toFixed(1)}h ({pct}%)</span>
      </div>
      <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function SportBadge({ sport = 'running' }) {
  const icons = {
    swimming: <MdPool size={16} className="text-blue-300" />,
    cycling: <MdDirectionsBike size={16} className="text-amber-400" />,
    running: <MdDirectionsRun size={16} className="text-emerald-400" />
  };
  return <div className="p-2 bg-[#1e1e1e] border border-white/10 rounded-lg">{icons[sport.toLowerCase()] || <MdDirectionsRun size={16} className="text-emerald-400" />}</div>;
}