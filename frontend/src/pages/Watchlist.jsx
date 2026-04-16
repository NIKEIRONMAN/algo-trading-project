import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StockCard from '../components/StockCard';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const Watchlist = () => {
  const navigate = useNavigate();
  const [stocks, setStocks]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchSym, setSearchSym] = useState('');
  const [addMsg, setAddMsg]       = useState('');
  const [adding, setAdding]       = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await api.get('/stocks/watchlist/prices');
      const data = res.data?.stocks || res.data || [];
      console.log('[Watchlist] Prices fetched:', data.length);
      setStocks(data);
    } catch (err) {
      console.error('[Watchlist] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();

    // Auto-refresh every 30 seconds
    const startCountdown = () => {
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchPrices();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    };
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, [fetchPrices]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!searchSym.trim()) return;
    setAdding(true);
    setAddMsg('');
    try {
      const sym = searchSym.trim().toUpperCase();
      await api.post('/stocks/watchlist', { symbol: sym });
      setAddMsg(`✅ ${sym} added!`);
      setSearchSym('');
      fetchPrices();
      console.log('[Watchlist] Added:', sym);
    } catch (err) {
      setAddMsg(`❌ ${err.response?.data?.message || 'Failed to add symbol'}`);
      console.error('[Watchlist] Add error:', err.message);
    } finally {
      setAdding(false);
      setTimeout(() => setAddMsg(''), 3000);
    }
  };

  const handleRemove = async (symbol) => {
    try {
      await api.delete(`/stocks/watchlist/${symbol}`);
      setStocks(prev => prev.filter(s => s.symbol !== symbol));
      console.log('[Watchlist] Removed:', symbol);
    } catch (err) {
      console.error('[Watchlist] Remove error:', err.message);
    }
  };

  const handleAddCondition = (symbol) => {
    navigate(`/conditions/create?symbol=${symbol}`);
  };

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
          <h1 className="text-2xl font-bold text-slate-100">Watchlist</h1>
          <p className="text-slate-400 text-sm mt-1">
            {stocks.length} stocks · Auto-refreshes in{' '}
            <span className="text-profit font-semibold">{countdown}s</span>
          </p>
        </div>
        <motion.button
          onClick={fetchPrices}
          className="btn-secondary text-sm flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🔄 Refresh
        </motion.button>
      </div>

      {/* Add New Symbol */}
      <div className="card mb-6">
        <form onSubmit={handleAdd} className="flex gap-3 items-start flex-wrap">
          <div className="flex-1 min-w-60">
            <input
              type="text"
              value={searchSym}
              onChange={e => setSearchSym(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g. TCS.NS, RELIANCE.NS, INFY.NS)"
              className="input-field"
            />
            <p className="text-slate-600 text-xs mt-1">Append .NS for NSE or .BO for BSE</p>
          </div>
          <motion.button
            type="submit"
            disabled={adding}
            className="btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {adding ? '⏳ Adding...' : '+ Add Symbol'}
          </motion.button>
        </form>
        {addMsg && (
          <motion.p
            className={`text-sm font-medium mt-2 ${addMsg.startsWith('✅') ? 'text-profit' : 'text-loss'}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {addMsg}
          </motion.p>
        )}
      </div>

      {/* Stock Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="Fetching live prices..." />
        </div>
      ) : stocks.length === 0 ? (
        <motion.div
          className="card text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-4">📭</p>
          <p className="text-slate-300 font-semibold text-lg mb-2">Your watchlist is empty</p>
          <p className="text-slate-500 text-sm mb-6">
            Add NSE/BSE symbols above to start monitoring live prices
          </p>
          <p className="text-slate-600 text-xs">
            Examples: TCS.NS · RELIANCE.NS · INFY.NS · HDFC.NS
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock, i) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <StockCard
                  stock={stock}
                  onRemove={handleRemove}
                  onAddCondition={handleAddCondition}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Watchlist;
