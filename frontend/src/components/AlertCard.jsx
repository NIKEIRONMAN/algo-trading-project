import React from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const ALERT_CONFIG = {
  SELL:    { icon: '🎯', label: 'Sell Alert',   cls: 'text-profit', bg: 'bg-profit/10',  border: 'border-profit/20' },
  BUY:     { icon: '📈', label: 'Buy Alert',    cls: 'text-accent', bg: 'bg-accent/10',  border: 'border-accent/20' },
  DROP:    { icon: '⚠️', label: 'Price Drop',   cls: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  EXPIRED: { icon: '⏰', label: 'Expired',      cls: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const AlertCard = ({ alert, onRefresh }) => {
  const { _id, alertType, symbol, triggerPrice, profitLossPercent, aiNote, emailSent, createdAt } = alert;
  const cfg = ALERT_CONFIG[alertType] || ALERT_CONFIG.SELL;
  const isProfit = (profitLossPercent || 0) >= 0;

  const handleDelete = async () => {
    try {
      await api.delete(`/alerts/${_id}`);
      console.log('[AlertCard] Deleted alert:', _id);
      onRefresh?.();
    } catch (err) {
      console.error('[AlertCard] Delete failed:', err.message);
    }
  };

  return (
    <motion.div
      className={`card border ${cfg.border} hover:border-opacity-60 transition-all duration-300`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      layout
      whileHover={{ x: 2 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${cfg.bg} text-2xl w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className={`font-bold text-sm ${cfg.cls}`}>{cfg.label}</span>
              <span className="text-slate-400 text-xs ml-2">• {symbol}</span>
            </div>
            <span className="text-slate-500 text-xs whitespace-nowrap">{timeAgo(createdAt)}</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <p className="text-slate-100 font-semibold text-sm">
              ₹{triggerPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '--'}
            </p>
            {profitLossPercent != null && (
              <span className={`text-sm font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
              </span>
            )}
            {emailSent && (
              <span className="text-xs bg-profit/10 text-profit border border-profit/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                ✅ Email sent
              </span>
            )}
          </div>

          {aiNote && (
            <p className="text-slate-400 text-xs bg-navy-900 rounded-lg px-2.5 py-2 mb-2">{aiNote}</p>
          )}

          <button
            onClick={handleDelete}
            className="text-slate-500 hover:text-loss text-xs transition-colors duration-200"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
