import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { to: '/watchlist', label: 'Watchlist', icon: '👁' },
  { to: '/conditions', label: 'Conditions', icon: '📊' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-800/95 backdrop-blur-sm border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-black">
              <span className="text-profit">⚡</span>
              <span className="text-slate-100"> AlgoTrade</span>
              <span className="text-profit text-sm font-semibold ml-1">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-profit bg-profit/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-navy-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-profit rounded-full"
                        layoutId="activeUnderline"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-profit/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-profit/20 flex items-center justify-center text-profit font-bold text-sm">
                      {user.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block text-slate-300 text-sm font-medium">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <motion.button
                  onClick={logout}
                  className="btn-danger text-sm px-3 py-1.5"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Logout
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-profit bg-profit/10'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {link.icon} {link.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
