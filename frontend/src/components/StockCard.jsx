import React from 'react';
import { motion } from 'framer-motion';

const StockCard = ({ stock, onRemove, onAddCondition, loading = false }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-6 w-24 mb-3" />
        <div className="skeleton h-10 w-32 mb-2" />
        <div className="skeleton h-5 w-20 mb-4" />
        <div className="skeleton h-9 w-full" />
      </div>
    );
  }

  const { symbol, price, change, changePercent, previousClose, exchange } = stock;
  const isPositive = changePercent >= 0;

  return (
    <motion.div
      className="card hover:border-navy-600 transition-all duration-300 group"
      whileHover={{ y: -3, boxShadow: isPositive ? '0 4px 20px rgba(0,255,136,0.1)' : '0 4px 20px rgba(255,68,68,0.1)' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-bold text-lg text-slate-100">{symbol?.replace('.NS', '')}</span>
          <span className="ml-2 text-xs bg-navy-700 text-slate-400 px-2 py-0.5 rounded-full">
            {exchange || 'NSE'}
          </span>
        </div>
        <button
          onClick={() => onRemove(symbol)}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-loss transition-all duration-200 text-lg leading-none"
          title="Remove from watchlist"
        >
          ✕
        </button>
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-slate-100">
          ₹{price != null ? price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '--'}
        </p>
        <div className={`flex items-center gap-1.5 mt-1 ${isPositive ? 'text-profit' : 'text-loss'}`}>
          <span className="text-lg">{isPositive ? '↑' : '↓'}</span>
          <span className="font-semibold text-sm">
            {change != null ? (isPositive ? '+' : '') + change.toFixed(2) : '--'}
          </span>
          <span className="font-semibold text-sm">
            ({changePercent != null ? (isPositive ? '+' : '') + changePercent.toFixed(2) : '--'}%)
          </span>
        </div>
      </div>

      {/* Previous Close */}
      <p className="text-slate-500 text-xs mb-4">
        Prev Close: ₹{previousClose != null ? previousClose.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '--'}
      </p>

      {/* Action */}
      <button
        onClick={() => onAddCondition(symbol)}
        className="w-full btn-primary text-sm text-center"
      >
        + Set Condition
      </button>
    </motion.div>
  );
};

export default StockCard;
