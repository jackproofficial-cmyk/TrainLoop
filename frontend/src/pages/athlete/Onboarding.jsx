import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export const Onboarding = () => {
  const { setUserProfile, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [mhr, setMhr] = useState('');
  const [rhr, setRhr] = useState('');
  const [ftp, setFtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedMhr = Number(mhr);
    if (!mhr || parsedMhr < 100 || parsedMhr > 230) {
      return setError('Please enter a valid Max Heart Rate (100-230 bpm).');
    }

    // 1. Define payload before logging/sending
    const payload = {
      metrics: {
        MHR: parsedMhr,
        ...(rhr && { RHR: Number(rhr) }),
        ...(ftp && { FTP: Number(ftp) }),
      },
    };

    setLoading(true);

    try {
      const { data } = await api.put('/users/profile', payload);

      setUserProfile(data.profile || data);

      if (typeof checkAuth === 'function') {
        await checkAuth();
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("-> X. Caught Error:", err);
      setError(err.response?.data?.message || 'Failed to save profile metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="bg-blue-200 w-full max-w-md rounded-2xl p-6 shadow-xl flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">Physiological Baseline</h1>
          <p className="text-xs text-gray-600 text-center mt-1">
            Provide your core metrics to establish training zones before accessing the dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">
              Max Heart Rate (bpm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 185"
              value={mhr}
              onChange={(e) => setMhr(e.target.value)}
              required
              min="100"
              max="230"
              className="bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white text-gray-800"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">
              Resting Heart Rate (bpm) <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 55"
              value={rhr}
              onChange={(e) => setRhr(e.target.value)}
              min="30"
              max="120"
              className="bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white text-gray-800"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">
              Cycling FTP (Watts) <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 250"
              value={ftp}
              onChange={(e) => setFtp(e.target.value)}
              min="50"
              max="600"
              className="bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-300 text-white rounded-xl py-3.5 mt-2 font-bold shadow-sm hover:bg-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving Metrics...' : 'Complete Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};