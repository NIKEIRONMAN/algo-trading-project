import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, color = 'accent', trend = null, loading = false }) => {
  const colorMap = {
    accent: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
    profit: { bg: 'bg-profit/10', text: 'text-profit', border: 'border-profit/20' },
    loss: { bg: 'bg-loss/10', text: 'text-loss', border: 'border-loss/20' },
    yellow: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20' },
  };
  const c = colorMap[color] || colorMap.accent;

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-5 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      className={`card border ${c.border} hover:glow-blue transition-all duration-300`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.p
            className="text-3xl font-bold text-slate-100 count-up"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.p>
          <p className="text-slate-400 text-sm mt-1 font-medium">{label}</p>
          {trend !== null && (
            <p className={`text-xs mt-1 font-semibold ${trend >= 0 ? 'text-profit' : 'text-loss'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </p>
          )}
        </div>
        <div className={`${c.bg} ${c.text} p-3 rounded-xl text-xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
