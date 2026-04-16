import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const sideLinks = [
  { to: '/dashboard',   icon: '⚡', label: 'Dashboard' },
  { to: '/watchlist',   icon: '👁',  label: 'Watchlist' },
  { to: '/conditions',  icon: '📊', label: 'Conditions' },
  { to: '/alerts',      icon: '🔔', label: 'Alerts' },
];

const Sidebar = ({ collapsed = false }) => {
  const location = useLocation();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-navy-800 border-r border-navy-700 pt-20 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      } min-h-screen fixed left-0 top-0`}
    >
      <nav className="flex-1 px-2 space-y-1 mt-4">
        {sideLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-profit/10 text-profit border border-profit/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-700'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-base">{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-navy-700">
          <p className="text-slate-600 text-xs text-center">AlgoTrade AI v1.0</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
