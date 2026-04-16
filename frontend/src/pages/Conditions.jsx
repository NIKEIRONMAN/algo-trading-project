import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ConditionCard from '../components/ConditionCard';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const TABS = ['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'];

const TAB_COLORS = {
  ALL:       'text-slate-300 border-slate-300',
  PENDING:   'text-yellow-400 border-yellow-400',
  ACTIVE:    'text-profit border-profit',
  COMPLETED: 'text-accent border-accent',
  EXPIRED:   'text-slate-500 border-slate-500',
  CANCELLED: 'text-loss border-loss',
};

const Conditions = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [activeTab, setActiveTab]   = useState('ALL');
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const res = await api.get('/conditions', { params });
      const data = res.data?.conditions || res.data || [];
      console.log('[Conditions] Loaded:', data.length, 'tab:', activeTab);
      setConditions(data);
    } catch (err) {
      console.error('[Conditions] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const counts = conditions.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trading Conditions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {conditions.length} condition{conditions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/conditions/create')}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          + Create New
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-navy-800 border border-navy-700 rounded-xl p-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const cnt = tab === 'ALL' ? conditions.length : (counts[tab] || 0);
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

      {/* Conditions Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="Loading conditions..." />
        </div>
      ) : conditions.length === 0 ? (
        <motion.div
          className="card text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-4">📊</p>
          <p className="text-slate-300 font-semibold text-lg mb-2">
            No {activeTab === 'ALL' ? '' : activeTab.toLowerCase() + ' '}conditions found
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {activeTab === 'ALL'
              ? 'Create your first trading condition to get started'
              : `Switch to "ALL" tab to see all conditions`}
          </p>
          {activeTab === 'ALL' && (
            <button
              onClick={() => navigate('/conditions/create')}
              className="btn-primary"
            >
              + Create First Condition
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conditions.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
              >
                <ConditionCard condition={c} onRefresh={load} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Conditions;
