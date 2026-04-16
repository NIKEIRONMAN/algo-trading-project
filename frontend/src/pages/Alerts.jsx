import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const TABS = ['ALL', 'SELL', 'BUY', 'DROP', 'EXPIRED'];

const TAB_COLORS = {
  ALL:     'text-slate-300 border-slate-300',
  SELL:    'text-profit border-profit',
  BUY:     'text-accent border-accent',
  DROP:    'text-yellow-400 border-yellow-400',
  EXPIRED: 'text-slate-500 border-slate-500',
};

const Alerts = () => {
  const [alerts, setAlerts]       = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { alertType: activeTab } : {};
      const res = await api.get('/alerts', { params });
      const data = res.data?.alerts || res.data || [];
      console.log('[Alerts] Loaded:', data.length, 'type:', activeTab);
      setAlerts(data);
    } catch (err) {
      console.error('[Alerts] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const counts = alerts.reduce((acc, a) => {
    acc[a.alertType] = (acc[a.alertType] || 0) + 1;
    return acc;
  }, {});

  const alertSummary = {
    total:   alerts.length,
    emailSent: alerts.filter(a => a.emailSent).length,
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alert History</h1>
          <p className="text-slate-400 text-sm mt-1">
            {alertSummary.total} total alerts · {alertSummary.emailSent} emails sent ✅
          </p>
        </div>
        <motion.button
          onClick={load}
          className="btn-secondary text-sm flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🔄 Refresh
        </motion.button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',   value: alerts.length,                           color: 'text-slate-100',  bg: 'bg-navy-800' },
          { label: 'Sell',    value: counts['SELL']    || 0,                  color: 'text-profit',     bg: 'bg-profit/5' },
          { label: 'Buy',     value: counts['BUY']     || 0,                  color: 'text-accent',     bg: 'bg-accent/5' },
          { label: 'Drop',    value: counts['DROP']    || 0,                  color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-navy-700 rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-navy-800 border border-navy-700 rounded-xl p-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const cnt = tab === 'ALL' ? alerts.length : (counts[tab] || 0);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? `bg-navy-700 ${TAB_COLORS[tab]} border-b-2`
                  : 'text-slate-500 hover:text-slate-300 hover:bg-navy-700/50'
              }`}
            >
              {tab}
              {cnt > 0 && (
                <span className="bg-navy-900 text-slate-400 px-1.5 py-0.5 rounded-full text-xs">
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="Loading alerts..." />
        </div>
      ) : alerts.length === 0 ? (
        <motion.div
          className="card text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-4">🔕</p>
          <p className="text-slate-300 font-semibold text-lg mb-2">
            No {activeTab === 'ALL' ? '' : activeTab + ' '}alerts yet
          </p>
          <p className="text-slate-500 text-sm">
            {activeTab === 'ALL'
              ? 'Alerts will appear here when your conditions trigger'
              : 'Try switching to "ALL" tab'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.04 }}
              >
                <AlertCard alert={a} onRefresh={load} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Alerts;
