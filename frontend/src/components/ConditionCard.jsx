import React from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', cls: 'badge-pending', dot: 'bg-yellow-400' },
  ACTIVE: { label: 'Active', cls: 'badge-active', dot: 'bg-profit' },
  COMPLETED: { label: 'Completed', cls: 'badge-completed', dot: 'bg-accent' },
  EXPIRED: { label: 'Expired', cls: 'badge-expired', dot: 'bg-slate-500' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled', dot: 'bg-loss' },
};

const ConditionCard = ({ condition, onRefresh }) => {
  const {
    _id, symbol, buyPrice, lastCheckedPrice, targetProfitPercent,
    maxDays, status, aiNote, createdAt, activatedAt
  } = condition;

  // Backend stores price as lastCheckedPrice, not currentPrice
  const currentPrice = lastCheckedPrice || condition.currentPrice;

  // Compute days elapsed from activatedAt (or createdAt if still pending)
  const startDate = activatedAt || createdAt;
  const daysElapsed = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const targetPrice = buyPrice * (1 + targetProfitPercent / 100);
  const pnlPercent = currentPrice
    ? ((currentPrice - buyPrice) / buyPrice) * 100
    : 0;
  const progressPercent = Math.min(
    Math.max((pnlPercent / targetProfitPercent) * 100, 0),
    100
  );
  const daysUsed = daysElapsed || 0;
  const isProfit = pnlPercent >= 0;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const handleCancel = async () => {
    if (!window.confirm('Cancel this condition?')) return;
    try {
      await api.patch(`/conditions/${_id}/cancel`);
      console.log('[ConditionCard] Cancelled:', _id);
      onRefresh?.();
    } catch (err) {
      console.error('[ConditionCard] Cancel failed:', err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this condition?')) return;
    try {
      await api.delete(`/conditions/${_id}`);
      console.log('[ConditionCard] Deleted:', _id);
      onRefresh?.();
    } catch (err) {
      console.error('[ConditionCard] Delete failed:', err.message);
    }
  };

  return (
    <motion.div
      className="card hover:border-navy-600 transition-all duration-300"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-navy-700 text-slate-100 font-bold text-sm px-3 py-1 rounded-lg">
            {symbol}
          </span>
          <div className={`flex items-center gap-1.5 ${cfg.cls}`}>
            {status === 'ACTIVE' && (
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} active-pulse`} />
            )}
            {cfg.label}
          </div>
        </div>
        <p className="text-slate-500 text-xs">
          {new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </p>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-navy-900 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs mb-1">Buy</p>
          <p className="text-slate-100 font-semibold text-sm">₹{buyPrice?.toFixed(2)}</p>
        </div>
        <div className="bg-navy-900 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs mb-1">Current</p>
          <p className={`font-semibold text-sm ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {currentPrice ? `₹${currentPrice.toFixed(2)}` : 'Fetching...'}
          </p>
        </div>
        <div className="bg-navy-900 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs mb-1">Target</p>
          <p className="text-accent font-semibold text-sm">₹{targetPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* P&L */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">P&amp;L</span>
        <span className={`font-bold text-lg ${isProfit ? 'text-profit' : 'text-loss'}`}>
          {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress to target</span>
          <span>{targetProfitPercent}% target</span>
        </div>
        <div className="w-full bg-navy-900 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${isProfit ? 'bg-profit' : 'bg-loss'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Days */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-xs">⏱ {daysUsed} of {maxDays} days used</span>
        <span className="text-slate-500 text-xs">{maxDays - daysUsed}d remaining</span>
      </div>

      {/* AI Note */}
      {aiNote && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-2.5 mb-4">
          <p className="text-accent text-xs font-medium mb-0.5">🤖 AI Note</p>
          <p className="text-slate-300 text-xs">{aiNote}</p>
        </div>
      )}

      {/* Actions */}
      {(status === 'ACTIVE' || status === 'PENDING') && (
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="btn-secondary flex-1 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger flex-1 text-sm"
          >
            Delete
          </button>
        </div>
      )}
      {(status === 'COMPLETED' || status === 'EXPIRED' || status === 'CANCELLED') && (
        <button
          onClick={handleDelete}
          className="btn-danger w-full text-sm"
        >
          Delete
        </button>
      )}
    </motion.div>
  );
};

export default ConditionCard;
