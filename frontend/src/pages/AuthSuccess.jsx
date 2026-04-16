import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    console.log('[AuthSuccess] Token received:', token ? '✅ exists' : '❌ missing');

    if (token) {
      login(token);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } else {
      console.error('[AuthSuccess] No token in URL!');
      navigate('/login', { replace: true });
    }
  }, [params, login, navigate]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <motion.div
            className="w-20 h-20 mx-auto rounded-full bg-profit/10 border-2 border-profit/30 flex items-center justify-center text-4xl"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚡
          </motion.div>
        </div>
        <LoadingSpinner size="md" message="Authentication successful! Redirecting..." />
        <p className="text-slate-600 text-xs mt-4">Powered by Google OAuth 2.0</p>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;
