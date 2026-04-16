import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Animated particle background
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.05 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    console.log('[Login] Redirecting to Google OAuth...');
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  const features = [
    { icon: '🤖', title: 'AI Decisions', desc: 'Groq & Gemini powered analysis' },
    { icon: '🔔', title: 'Auto Alerts',  desc: 'Email alerts on target hit' },
    { icon: '📈', title: 'Live Prices',  desc: 'Real-time NSE/BSE data' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center relative overflow-hidden">
      <ParticleCanvas />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-profit/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="bg-navy-800/90 backdrop-blur-xl border border-navy-700 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-profit/10 border border-profit/30 mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-3xl">⚡</span>
            </motion.div>
            <h1 className="text-3xl font-black text-slate-100">
              Algo<span className="text-profit">Trade</span> AI
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              AI-Powered Stock Monitoring & Alerts
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {features.map((f) => (
              <motion.div
                key={f.title}
                className="bg-navy-900 border border-navy-700 rounded-xl p-3 text-center"
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-slate-100 text-xs font-semibold">{f.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Google Login Button */}
          <motion.button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Google SVG */}
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </motion.button>

          <p className="text-center text-slate-500 text-xs mt-5">
            🔒 Secured with Google OAuth 2.0 · Your data is safe
          </p>
        </div>

        {/* Bottom tag */}
        <p className="text-center text-slate-600 text-xs mt-4">
          AlgoTrade AI © {new Date().getFullYear()} · Built for Indian Markets
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
