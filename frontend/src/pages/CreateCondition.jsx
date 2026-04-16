import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const CreateCondition = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    symbol:             params.get('symbol') || '',
    buyPrice:           '',
    targetProfitPercent:'',
    maxDays:            7,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const targetPrice = form.buyPrice && form.targetProfitPercent
    ? (parseFloat(form.buyPrice) * (1 + parseFloat(form.targetProfitPercent) / 100)).toFixed(2)
    : null;

  // Auto-fetch live price when symbol is entered
  const fetchLivePrice = async (sym) => {
    if (!sym || sym.length < 3) return;
    setFetchingPrice(true);
    try {
      const res = await api.get(`/stocks/price/${sym}`);
      const price = res.data?.price || res.data?.currentPrice;
      if (price) {
        setForm(prev => ({ ...prev, buyPrice: price.toFixed(2) }));
        console.log('[CreateCondition] Live price fetched:', sym, price);
      }
    } catch (err) {
      console.warn('[CreateCondition] Price fetch failed:', err.message);
    } finally {
      setFetchingPrice(false);
    }
  };

  useEffect(() => {
    if (form.symbol.includes('.')) fetchLivePrice(form.symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.symbol]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.buyPrice || !form.targetProfitPercent) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        symbol:              form.symbol.toUpperCase().trim(),
        buyPrice:            parseFloat(form.buyPrice),
        targetProfitPercent: parseFloat(form.targetProfitPercent),
        maxDays:             parseInt(form.maxDays, 10),
      };
      console.log('[CreateCondition] Submitting:', payload);
      await api.post('/conditions', payload);
      navigate('/conditions');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create condition.';
      setError(msg);
      console.error('[CreateCondition] Submit error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-100 text-sm mb-3 transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-100">Create Condition</h1>
        <p className="text-slate-400 text-sm mt-1">Set a price target alert for a stock</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Symbol */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Stock Symbol <span className="text-loss">*</span>
            </label>
            <input
              type="text"
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              onBlur={e => fetchLivePrice(e.target.value.toUpperCase())}
              placeholder="e.g. TCS.NS, RELIANCE.NS, INFY.BO"
              className="input-field uppercase"
              required
            />
            <p className="text-slate-600 text-xs mt-1">
              Append .NS for NSE or .BO for BSE
            </p>
          </div>

          {/* Buy Price */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Buy Price (₹) <span className="text-loss">*</span>
              {fetchingPrice && (
                <span className="ml-2 text-accent text-xs animate-pulse">Fetching live price...</span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                name="buyPrice"
                value={form.buyPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field pl-8"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          {/* Target Profit % */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Target Profit % <span className="text-loss">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="targetProfitPercent"
                value={form.targetProfitPercent}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="input-field pr-8"
                step="0.1"
                min="0.1"
                max="1000"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">%</span>
            </div>
            {targetPrice && form.buyPrice && (
              <motion.p
                className="text-profit text-xs mt-1 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Target Price → ₹{parseFloat(targetPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </motion.p>
            )}
          </div>

          {/* Max Days Slider */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Max Days: <span className="text-profit font-bold">{form.maxDays}</span>
            </label>
            <input
              type="range"
              name="maxDays"
              min="1"
              max="365"
              value={form.maxDays}
              onChange={handleChange}
              className="w-full accent-[#00FF88] cursor-pointer"
            />
            <div className="flex justify-between text-slate-600 text-xs mt-1">
              <span>1 day</span>
              <span>6 months</span>
              <span>1 year</span>
            </div>
          </div>

          {/* Live Preview */}
          {form.symbol && form.buyPrice && form.targetProfitPercent && (
            <motion.div
              className="bg-profit/5 border border-profit/20 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-slate-400 text-xs font-medium mb-1">📋 Preview</p>
              <p className="text-slate-100 font-semibold text-sm leading-relaxed">
                If{' '}
                <span className="text-profit">{form.symbol.toUpperCase()}</span>{' '}
                reaches{' '}
                <span className="text-profit font-bold">
                  ₹{parseFloat(targetPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                , you will get a{' '}
                <span className="text-profit font-bold">{form.targetProfitPercent}%</span>{' '}
                profit within{' '}
                <span className="text-accent font-bold">{form.maxDays}</span>{' '}
                day{parseInt(form.maxDays) !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.p
              className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-xl px-4 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠️ {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3.5 text-base font-bold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? '⏳ Creating Condition...' : '🎯 Set Alert'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateCondition;
