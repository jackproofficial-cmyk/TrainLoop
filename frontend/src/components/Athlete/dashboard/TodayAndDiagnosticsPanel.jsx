import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, Heart, Moon, Gauge, BatteryCharging, Info } from 'lucide-react';

export default function TodayAndDiagnosticsPanel({ todaySession, recovery }) {
  const [activeTab, setActiveTab] = useState('session'); // 'session' | 'recovery'

  const sessionName = todaySession?.name || todaySession?.title || 'VO2Max Hill Repeats';
  const duration = todaySession?.duration || todaySession?.durationMinutes ? `${todaySession.duration || todaySession.durationMinutes}m` : '55m';
  const distance = todaySession?.distance ? `${todaySession.distance} km` : '10.5 km';
  const tss = todaySession?.tss ?? 75;
  const intensityFactor = todaySession?.intensityFactor ?? todaySession?.if ?? 0.88;
  const status = todaySession?.status || 'SCHEDULED';
  const category = todaySession?.category || todaySession?.type || 'TARGET SESSION';

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-3.5 flex flex-col gap-3 font-sans text-zinc-100">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
        <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('session')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'session'
                ? 'bg-blue-300/20 text-blue-300 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Session
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'recovery'
                ? 'bg-blue-300/20 text-blue-300 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Recovery Hub
          </button>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded border border-blue-300/20 bg-blue-300/10 text-blue-300 uppercase">
          {status}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-3">
        {activeTab === 'session' ? (
          <>
            {/* Session Summary Card */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-3.5">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block">
                {category}
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <Zap size={16} className="text-blue-300 shrink-0" />
                {sessionName}
              </h3>

              {/* 4 Primary Metrics */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                <div className="bg-[#181818] border border-white/5 rounded p-2 text-center">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">Duration</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">{duration}</div>
                </div>
                <div className="bg-[#181818] border border-white/5 rounded p-2 text-center">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">Distance</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">{distance}</div>
                </div>
                <div className="bg-[#181818] border border-white/5 rounded p-2 text-center">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">TSS</div>
                  <div className="text-xs font-mono font-bold text-blue-300 mt-0.5">{tss}</div>
                </div>
                <div className="bg-[#181818] border border-white/5 rounded p-2 text-center">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">IF</div>
                  <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">{intensityFactor}</div>
                </div>
              </div>
            </div>

            {/* Workout Profile Card (Compact Layout without Vertical Stretched Gaps) */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Activity size={14} className="text-blue-300" />
                  Workout Profile
                </span>
                <span className="text-zinc-500 text-[11px]">Threshold Intensity</span>
              </div>

              {/* Interval Profile Chart */}
              <div className="flex items-end gap-1.5 h-16 p-2 bg-[#181818] rounded border border-white/5">
                <div className="flex-1 bg-zinc-700/50 rounded-t h-2/5 flex items-center justify-center text-[9px] font-mono text-zinc-300">WU</div>
                <div className="flex-1 bg-zinc-600/70 rounded-t h-4/5 flex items-center justify-center text-[9px] font-mono text-zinc-200">Set 1</div>
                <div className="flex-1 bg-zinc-800 rounded-t h-1/4 flex items-center justify-center text-[9px] font-mono text-zinc-500">Rest</div>
                <div className="flex-1 bg-blue-300/80 rounded-t h-full flex items-center justify-center text-[9px] font-mono text-zinc-950 font-bold">Set 2</div>
                <div className="flex-1 bg-zinc-800 rounded-t h-1/4 flex items-center justify-center text-[9px] font-mono text-zinc-500">Rest</div>
                <div className="flex-1 bg-zinc-600/70 rounded-t h-4/5 flex items-center justify-center text-[9px] font-mono text-zinc-200">Set 3</div>
                <div className="flex-1 bg-zinc-700/50 rounded-t h-2/5 flex items-center justify-center text-[9px] font-mono text-zinc-300">CD</div>
              </div>

              {/* Interval Breakdown Badges */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1.5 bg-[#181818] rounded text-zinc-400 border border-white/5 flex-1 text-center truncate">
                  WU <strong className="text-zinc-200 ml-1">15m Z2</strong>
                </span>
                <span className="px-2.5 py-1.5 bg-blue-300/10 rounded text-blue-300 border border-blue-300/20 flex-[1.4] text-center font-semibold truncate">
                  MAIN <strong className="text-white ml-1">3x12m LT2</strong>
                </span>
                <span className="px-2.5 py-1.5 bg-[#181818] rounded text-zinc-400 border border-white/5 flex-1 text-center truncate">
                  CD <strong className="text-zinc-200 ml-1">18m Easy</strong>
                </span>
              </div>

              {/* Coach Guidance Note */}
              <div className="bg-[#181818] border border-white/5 rounded p-2.5 text-xs font-mono text-zinc-400 flex items-start gap-2">
                <Info size={14} className="text-blue-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Target 92–95% HRmax on hill repeats. Maintain 3 min light recovery spin between sets.</span>
              </div>
            </div>

            {/* Recovery Diagnostics Status Bar */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-300" />
                <div>
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">Recovery Status</div>
                  <div className="text-xs font-mono font-semibold text-blue-300">Optimal Readiness</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono text-zinc-400 uppercase">Injury Risk</div>
                <div className="text-xs font-mono font-semibold text-zinc-300">Low (12%)</div>
              </div>
            </div>
          </>
        ) : (
          /* Recovery Hub View */
          <div className="flex flex-col gap-3">
            <div className="bg-[#121212] border border-white/10 rounded-lg p-3.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Recovery Diagnostics</span>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-300/10 border border-blue-300/20 px-2 py-0.5 rounded">
                Optimal
              </span>
            </div>

            {/* 2x2 Diagnostics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#121212] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <Heart size={13} className="text-blue-300" /> HRV Score
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  {recovery?.hrvRmssd || recovery?.hrv || 58} <span className="text-xs font-normal text-zinc-400">ms</span>
                </div>
              </div>

              <div className="bg-[#121212] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <Moon size={13} className="text-blue-300" /> Sleep Quality
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  {recovery?.sleepScore || 79}%
                </div>
              </div>

              <div className="bg-[#121212] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <Gauge size={13} className="text-blue-300" /> Resting HR
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  48 <span className="text-xs font-normal text-zinc-400">bpm</span>
                </div>
              </div>

              <div className="bg-[#121212] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <BatteryCharging size={13} className="text-blue-300" /> Muscle Readiness
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  High <span className="text-xs font-normal text-zinc-400">(91%)</span>
                </div>
              </div>
            </div>

            {/* Baseline Range Bar */}
            <div className="bg-[#121212] p-3.5 rounded-lg border border-white/10">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-2">
                <span>7-Day HRV Baseline Range</span>
                <span className="text-blue-300 font-medium">In Target Zone</span>
              </div>
              <div className="w-full bg-[#181818] h-2 rounded-full relative overflow-hidden border border-white/5">
                <div className="absolute left-[30%] w-[45%] bg-blue-300/25 h-full"></div>
                <div className="absolute left-[52%] w-2 h-full bg-blue-300 rounded-full"></div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1.5">
                <span>50 ms</span>
                <span>65-75 ms (Target)</span>
                <span>90 ms</span>
              </div>
            </div>

            {/* Load Recommendation Box */}
            <div className="bg-[#121212] p-3.5 rounded-lg border border-white/10 text-xs font-mono">
              <div className="text-zinc-200 font-semibold flex items-center gap-1.5 mb-1.5">
                <Info size={14} className="text-blue-300" /> Load Recommendation
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Acute load is well within target parameters (+4% ATL delta). Sleep architecture shows optimal deep sleep (1h 42m). Proceed with today's scheduled interval session.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}