import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

// Small sparkline stub chart using price history
const SparkLine = ({ symbol, isProfit }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate mock sparkline data around current price for visual
    const base = Math.random() * 1000 + 500;
    setData(
      Array.from({ length: 10 }, (_, i) => ({
        v: base + (Math.random() - 0.48) * 15 * (i + 1),
      }))
    );
  }, [symbol]);

  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={isProfit ? '#00FF88' : '#FF4444'}
          dot={false}
          strokeWidth={1.5}
        />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 11 }}
          formatter={(v) => [`₹${v.toFixed(2)}`, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeConditions, setActiveConditions] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [watchSymbol, setWatchSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingWatch, setAddingWatch] = useState(false);
  const [watchMsg, setWatchMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const [condRes, alertRes] = await Promise.all([
        api.get('/conditions'),
        api.get('/alerts'),
      ]);
      const conditions = condRes.data?.conditions || condRes.data || [];
      const alerts    = alertRes.data?.alerts    || alertRes.data || [];

      console.log('[Dashboard] Conditions:', conditions.length, '| Alerts:', alerts.length);

      setActiveConditions(conditions.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING'));
      setRecentAlerts(alerts.slice(0, 5));

      const today = new Date().toDateString();
      setStats({
        total:     conditions.length,
        active:    conditions.filter(c => c.status === 'ACTIVE').length,
        completed: conditions.filter(c => {
          const d = new Date(c.updatedAt || c.createdAt).toDateString();
          return c.status === 'COMPLETED' && d === today;
        }).length,
        alertsCount: alerts.length,
      });
    } catch (err) {
      console.error('[Dashboard] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddWatch = async (e) => {
    e.preventDefault();
    if (!watchSymbol.trim()) return;
    setAddingWatch(true);
    setWatchMsg('');
    try {
      const sym = watchSymbol.trim().toUpperCase();
      await api.post('/stocks/watchlist', { symbol: sym });
      setWatchMsg(`✅ ${sym} added!`);
      setWatchSymbol('');
      console.log('[Dashboard] Added to watchlist:', sym);
    } catch (err) {
      setWatchMsg(`❌ ${err.response?.data?.message || 'Failed to add'}`);
      console.error('[Dashboard] Watchlist add error:', err.message);
    } finally {
      setAddingWatch(false);
      setTimeout(() => setWatchMsg(''), 3000);
    }
  };

  const statCards = [
    { label: 'Total Conditions', value: stats?.total ?? 0,        icon: '📊', color: 'accent' },
    { label: 'Active Now',       value: stats?.active ?? 0,        icon: '🟢', color: 'profit' },
    { label: 'Completed Today',  value: stats?.completed ?? 0,     icon: '✅', color: 'profit' },
    { label: 'Alerts Sent',      value: stats?.alertsCount ?? 0,   icon: '🔔', color: 'loss'   },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your trading conditions & alerts</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={s.label} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Active Conditions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Active Conditions</h2>
            <button
              onClick={() => navigate('/conditions')}
              className="text-accent text-sm hover:text-blue-400 transition-colors"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : activeConditions.length === 0 ? (
            <motion.div
              className="card text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 font-medium">No active conditions</p>
              <button
                onClick={() => navigate('/conditions/create')}
                className="btn-primary mt-4 text-sm"
              >
                Create Condition
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {activeConditions.map((c, i) => {
                const curPrice = c.lastCheckedPrice || c.currentPrice;
                const pnl = curPrice
                  ? ((curPrice - c.buyPrice) / c.buyPrice) * 100
                  : 0;
                const isProfit = pnl >= 0;
                const progress = Math.min(Math.max((pnl / c.targetProfitPercent) * 100, 0), 100);
                const startDate = c.activatedAt || c.createdAt;
                const daysElapsed = startDate
                  ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <motion.div
                    key={c._id}
                    className="card hover:border-navy-600 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-navy-700 text-slate-100 font-bold text-sm px-3 py-1 rounded-lg">
                          {c.symbol}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          c.status === 'ACTIVE'
                            ? 'bg-profit/10 text-profit border border-profit/30'
                            : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                        }`}>
                          {c.status === 'ACTIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-profit active-pulse mr-1" />}
                          {c.status}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                        {isProfit ? '+' : ''}{pnl.toFixed(2)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Buy</p>
                        <p className="text-slate-200 font-semibold">₹{c.buyPrice?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Current</p>
                        <p className={`font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                          {curPrice ? `₹${curPrice.toFixed(2)}` : '…'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Target {c.targetProfitPercent}%</p>
                        <p className="text-accent font-semibold">₹{(c.buyPrice * (1 + c.targetProfitPercent / 100)).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-navy-900 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-1.5 rounded-full ${isProfit ? 'bg-profit' : 'bg-loss'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ⏱ {daysElapsed} of {c.maxDays} days · {Math.max(c.maxDays - daysElapsed, 0)}d left
                      </p>
                    </div>

                    {/* Mini Chart */}
                    <SparkLine symbol={c.symbol} isProfit={isProfit} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Right — Alerts + Quick Add */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-100">Recent Alerts</h2>
              <button
                onClick={() => navigate('/alerts')}
                className="text-accent text-sm hover:text-blue-400 transition-colors"
              >
                View All →
              </button>
            </div>
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : recentAlerts.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-2xl mb-2">🔕</p>
                <p className="text-slate-500 text-sm">No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {recentAlerts.map((a) => (
                    <AlertCard key={a._id} alert={a} onRefresh={load} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick Add Watchlist */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">⚡ Quick Add Watchlist</h3>
            <form onSubmit={handleAddWatch} className="space-y-3">
              <input
                type="text"
                value={watchSymbol}
                onChange={e => setWatchSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. TCS.NS, RELIANCE.NS"
                className="input-field text-sm"
              />
              <motion.button
                type="submit"
                disabled={addingWatch}
                className="btn-primary w-full text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {addingWatch ? '⏳ Adding...' : '+ Add to Watchlist'}
              </motion.button>
            </form>
            {watchMsg && (
              <motion.p
                className={`text-xs mt-2 font-medium ${watchMsg.startsWith('✅') ? 'text-profit' : 'text-loss'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {watchMsg}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
